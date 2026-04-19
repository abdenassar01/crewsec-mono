import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { requireAdminOrEmployee, getAuthenticatedUser } from './auth/helpers';

const controlFeeStatus = v.union(
  v.literal('AWAITING'),
  v.literal('PAID'),
  v.literal('CANCELED'),
  v.literal('CONFLICT'),
);

export const get = query({
  args: { id: v.id('controlFees') },
  handler: async (ctx, args) => {
    await requireAdminOrEmployee(ctx);
    const fee = await ctx.db.get(args.id);
    if (!fee) return null;

    // Fetch related data
    const town = await ctx.db.get(fee.townId);
    const locationViolation = await ctx.db.get(fee.locationViolationId);
    let violation = null;
    let location = null;

    if (locationViolation) {
      violation = await ctx.db.get(locationViolation.violationId);
      location = await ctx.db.get(locationViolation.locationId);
    }

    return {
      ...fee,
      town,
      locationViolation,
      violation,
      location,
    };
  },
});

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    townId: v.optional(v.id('towns')),
    violationId: v.optional(v.id('violations')),
  },
  handler: async (ctx, args) => {
    await requireAdminOrEmployee(ctx);

    // Get all fees first (we'll filter manually since chaining withIndex is tricky)
    let fees: any;

    if (args.townId) {
      fees = await ctx.db
        .query('controlFees')
        .withIndex('by_townId', (q: any) => q.eq('townId', args.townId))
        .order('desc')
        .collect();
    } else {
      fees = await ctx.db.query('controlFees').order('desc').collect();
    }

    // Filter by violationId if provided
    if (args.violationId) {
      const locationViolations = await ctx.db
        .query('locationViolations')
        .withIndex('by_violationId', (q: any) =>
          q.eq('violationId', args.violationId!),
        )
        .collect();
      const lvIds = locationViolations.map((lv: any) => lv._id);
      fees = fees.filter((fee: any) => lvIds.includes(fee.locationViolationId));
    }

    // Paginate the results
    const start = args.paginationOpts.cursor
      ? parseInt(args.paginationOpts.cursor)
      : 0;
    const end = start + args.paginationOpts.numItems;

    const paginatedFees = fees.slice(start, end);
    const isDone = end >= fees.length;

    return {
      page: paginatedFees,
      continueCursor: isDone ? '' : String(end),
      isDone,
    };
  },
});

export const create = mutation({
  args: {
    reference: v.string(),
    mark: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    isSignsChecked: v.boolean(),
    isPhotosTaken: v.boolean(),
    status: controlFeeStatus,
    townId: v.id('towns'),
    ticketUrl: v.optional(v.id('_storage')),
    locationViolationId: v.id('locationViolations'),
    galleryStorageIds: v.array(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const user = await requireAdminOrEmployee(ctx);
    await ctx.db.insert('controlFees', {
      ...args,
      createdAt: Date.now(),
      createdBy: user._id,
    });
  },
});

export const createFromVehicle = mutation({
  args: {
    reference: v.string(),
    mark: v.string(),
    townId: v.id('towns'),
    locationViolationId: v.id('locationViolations'),
    vehicleId: v.id('vehicles'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .unique();

    if (!parking || vehicle.parkingId !== parking._id) {
      throw new Error('Vehicle does not belong to your parking');
    }

    const now = Date.now();
    await ctx.db.insert('controlFees', {
      reference: args.reference,
      mark: args.mark,
      startDate: vehicle.joinDate,
      endDate: vehicle.leaveDate || now,
      isSignsChecked: false,
      isPhotosTaken: false,
      status: 'AWAITING',
      townId: args.townId,
      locationViolationId: args.locationViolationId,
      galleryStorageIds: [],
      createdAt: now,
      createdBy: user._id,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('controlFees'),
    reference: v.string(),
    mark: v.string(),
    status: controlFeeStatus,
    isSignsChecked: v.boolean(),
    isPhotosTaken: v.boolean(),
    galleryStorageIds: v.array(v.id('_storage')),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdminOrEmployee(ctx);
    await ctx.db.patch(id, rest);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id('controlFees'),
    status: controlFeeStatus,
  },
  handler: async (ctx, args) => {
    await requireAdminOrEmployee(ctx);
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteFee = mutation({
  args: { id: v.id('controlFees') },
  handler: async (ctx, args) => {
    await requireAdminOrEmployee(ctx);
    const fee = await ctx.db.get(args.id);
    // Delete associated images from storage
    if (fee && fee.galleryStorageIds) {
      await Promise.all(
        fee.galleryStorageIds.map((id) => ctx.storage.delete(id)),
      );
    }
    await ctx.db.delete(args.id);
  },
});

export const getById = query({
  args: { id: v.id('controlFees') },
  handler: async (ctx, args) => {
    await requireAdminOrEmployee(ctx);
    const fee = await ctx.db.get(args.id);
    if (!fee) return null;

    const town = await ctx.db.get(fee.townId);
    const locationViolation = await ctx.db.get(fee.locationViolationId);
    const violation = locationViolation
      ? await ctx.db.get(locationViolation.violationId)
      : null;
    const location = locationViolation
      ? await ctx.db.get(locationViolation.locationId)
      : null;

    // Generate URLs for storage images
    const ticketUrl = fee.ticketUrl
      ? await ctx.storage.getUrl(fee.ticketUrl)
      : null;
    const galleryUrls = await Promise.all(
      fee.galleryStorageIds.map((id) => ctx.storage.getUrl(id)),
    );

    return {
      ...fee,
      _id: fee._id,
      ticketUrl,
      gallery: galleryUrls.filter(Boolean) as string[],
      galleryStorageIds: fee.galleryStorageIds,
      town: town
        ? {
            _id: town._id,
            label: town.label,
            number: town.number,
            location: null,
          }
        : null,
      violation: locationViolation
        ? {
            _id: locationViolation._id,
            location: location
              ? {
                  _id: location._id,
                  label: location.label,
                }
              : null,
            price: locationViolation.price,
            violation: violation
              ? {
                  _id: violation._id,
                  number: violation.number,
                  label: violation.label,
                }
              : null,
          }
        : null,
    };
  },
});

export const listWithDetails = query({
  args: {
    paginationOpts: paginationOptsValidator,
    townId: v.optional(v.id('towns')),
  },
  handler: async (ctx, args) => {
    await requireAdminOrEmployee(ctx);

    const paginatedFees = args.townId
      ? await ctx.db
          .query('controlFees')
          .withIndex('by_townId', (q) => q.eq('townId', args.townId!))
          .order('desc')
          .paginate(args.paginationOpts)
      : await ctx.db
          .query('controlFees')
          .order('desc')
          .paginate(args.paginationOpts);

    // Fetch related data for each fee
    const feesWithDetails = await Promise.all(
      paginatedFees.page.map(async (fee) => {
        const locationViolation = await ctx.db.get(fee.locationViolationId);

        return {
          ...fee,
          violation: {
            price: locationViolation?.price ?? 0,
          },
        };
      }),
    );

    return {
      page: feesWithDetails,
      continueCursor: paginatedFees.continueCursor,
      isDone: paginatedFees.isDone,
    };
  },
});
