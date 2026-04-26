/* eslint-disable max-lines-per-function */
import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import { type Doc, type Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { authComponent, createAuth } from './auth';
import {
  AdminAuthError,
  getAuthenticatedUser,
  getOrganizationId,
  requireAdmin,
  requireAdminOrEmployee,
  requireOrgAccess,
  verifyOrgOwnership,
  withAdminCheck,
} from './auth/helpers';
import { type CustomResponse, ErrorCodes, failure, success } from './util';

export const list = query({
  args: { query: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const orgId = getOrganizationId(user);

    if(user?.role === "CLIENT") return success([]);

    let parkings: Doc<'parkings'>[] = [];

    if (args.query) {
      parkings = await ctx.db
        .query('parkings')
        .withSearchIndex('by_name', (q) => q.search('name', args.query || ''))
        .collect();
      if (orgId) {
        parkings = parkings.filter((p) => p.organizationId === orgId);
      }
    } else if (orgId) {
      parkings = await ctx.db
        .query('parkings')
        .withIndex('by_organizationId', (q) => q.eq('organizationId', orgId))
        .order('desc')
        .collect();
    } else {
      parkings = await ctx.db.query('parkings').order('desc').collect();
    }

    const pageWithUsers = (
      await Promise.all(
        parkings.map(async (parking) => {
          const parkingUser = await ctx.db.get(parking.userId);
          if (!parkingUser || !parkingUser.enabled) return null;
          const imageUrl = parking.imageStorageId
            ? await ctx.storage.getUrl(parking.imageStorageId)
            : null;
          return { ...parking, user: parkingUser, imageUrl };
        }),
      )
    ).filter((p): p is NonNullable<typeof p> => p !== null);

    return success(pageWithUsers);
  },
});

export const getByUserId = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();
  },
});

export const getMyParking = query({
  args: {},
  handler: async (ctx): Promise<CustomResponse<any>> => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return failure('Unauthenticated', ErrorCodes.UNAUTHORIZED);

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .unique();

    if (!parking) return success(null);

    const imageUrl = parking.imageStorageId
      ? (await ctx.storage.getUrl(parking.imageStorageId)) || ''
      : '';

    if (!parking.organizationId) return success({ parking: { ...parking, imageUrl }, user });

    const organization = await ctx.db.get(parking.organizationId);
    if (!organization) return success({ parking: { ...parking, imageUrl }, user });

    return success({ parking: { ...parking, imageUrl, organization }, user });
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    website: v.string(),
    address: v.string(),
    userId: v.id('users'),
    imageStorageId: v.optional(v.id('_storage')),
    maxCapacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    await ctx.db.insert('parkings', {
      ...args,
      organizationId: getOrganizationId(user) ?? undefined,
      unresolvedFelparkering: 0,
      unresolvedMakuleras: 0,
    });
  },
});

export const getUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteImage = mutation({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.storage.delete(args.storageId);
  },
});

export const updateParkingAndUser = mutation({
  args: {
    parkingId: v.id('parkings'),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal('ADMIN'),
      v.literal('EMPLOYEE'),
      v.literal('CLIENT'),
    ),
    parkingName: v.string(),
    description: v.string(),
    location: v.string(),
    website: v.string(),
    address: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
    maxCapacity: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<CustomResponse<{ success: boolean }>> => {
    return withAdminCheck(ctx, async (currentUser) => {
      const {
        parkingId,
        email,
        name,
        phone,
        role,
        parkingName,
        description,
        location,
        website,
        address,
        imageStorageId,
        maxCapacity,
      } = args;

      const parking = await ctx.db.get(parkingId);
      if (!parking) return failure('Parking not found', ErrorCodes.NOT_FOUND);
      if (!verifyOrgOwnership(currentUser, parking.organizationId)) return failure('Not authorized', ErrorCodes.FORBIDDEN);

      if (maxCapacity !== undefined) {
        const currentVehicles = await ctx.db
          .query('vehicles')
          .withIndex('by_parkingId', (q) => q.eq('parkingId', parkingId))
          .collect();

        if (currentVehicles.length > maxCapacity) {
          return failure(
            `Cannot set capacity to ${maxCapacity}. Parking already has ${currentVehicles.length} vehicles.`,
            ErrorCodes.CONFLICT,
          );
        }
      }

      await Promise.all([
        ctx.db.patch(parking.userId, { email, name, phone, role }),
        ctx.db.patch(parkingId, {
          name: parkingName,
          description,
          location,
          website,
          address,
          imageStorageId,
          maxCapacity,
        }),
      ]);

      return success({ success: true });
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('parkings'),
    name: v.string(),
    description: v.string(),
    location: v.string(),
    website: v.string(),
    address: v.string(),
    userId: v.id('users'),
    imageStorageId: v.optional(v.id('_storage')),
    maxCapacity: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...rest }) => {
    const user = await requireAdmin(ctx);
    const parking = await ctx.db.get(id);
    if (!parking) throw new Error('Parking not found');
    if (!verifyOrgOwnership(user, parking.organizationId)) throw new AdminAuthError();
    await ctx.db.patch(id, rest);
  },
});

export const anonymizeParking = mutation({
  args: { id: v.id('parkings') },
  handler: async (
    ctx,
    args,
  ): Promise<
    CustomResponse<{
      success: boolean;
      message: string;
      anonymizedVehiclesCount: number;
      deletedReportsCount: number;
    }>
  > => {
    return withAdminCheck(ctx, async (currentUser) => {
      const parking = await ctx.db.get(args.id);
      if (!parking) return failure('Parking not found', ErrorCodes.NOT_FOUND);
      if (!verifyOrgOwnership(currentUser, parking.organizationId)) return failure('Not authorized', ErrorCodes.FORBIDDEN);

      const parkingId = args.id;

      const vehicles = await ctx.db
        .query('vehicles')
        .withIndex('by_parkingId', (q) => q.eq('parkingId', parkingId))
        .collect();

      await Promise.all(
        vehicles.map((vehicle) =>
          ctx.db.patch(vehicle._id, {
            reference: `ANON-${vehicle._id.substring(0, 8)}`,
            name: 'Anonymized Vehicle',
          }),
        ),
      );

      const reports = await ctx.db
        .query('canceledViolations')
        .withIndex('by_parkingId', (q) => q.eq('parkingId', parkingId))
        .collect();

      await Promise.all(reports.map((report) => ctx.db.delete(report._id)));

      if (parking.imageStorageId) {
        await ctx.storage.delete(parking.imageStorageId);
      }

      await ctx.db.patch(parkingId, {
        name: `[Anonymized Parking ${parkingId.substring(0, 6)}]`,
        description: '',
        location: 'N/A',
        website: '',
        address: '',
        imageStorageId: undefined,
        unresolvedMakuleras: 0,
        unresolvedFelparkering: 0,
      });

      return success({
        success: true,
        message: 'Parking and associated vehicles have been successfully anonymized.',
        anonymizedVehiclesCount: vehicles.length,
        deletedReportsCount: reports.length,
      });
    });
  },
});

export const createUserAndParking = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(
      v.literal('ADMIN'),
      v.literal('EMPLOYEE'),
      v.literal('CLIENT'),
    ),
    parkingName: v.string(),
    parkingDescription: v.string(),
    parkingLocation: v.string(),
    parkingWebsite: v.string(),
    parkingAddress: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
    maxCapacity: v.optional(v.number()),
    organizationId: v.optional(v.id('organizations')),
  },
  handler: async (
    ctx,
    args,
  ): Promise<
    CustomResponse<{
      success: boolean;
      message: string;
    }>
  > => {
    return withAdminCheck(ctx, async (currentUser) => {
      const orgId = currentUser.role === 'SUPER_ADMIN'
        ? (args.organizationId ?? getOrganizationId(currentUser))
        : getOrganizationId(currentUser);

      const session = await createAuth(ctx).api.signUpEmail({
        body: { email: args.email, password: args.password, name: args.name },
      });

      if (!session?.user?.id) {
        return failure('User creation failed, could not retrieve user ID', ErrorCodes.INTERNAL_SERVER_ERROR);
      }

      let user = await ctx.db
        .query('users')
        .withIndex('by_userId', (q) => q.eq('userId', session.user.id))
        .unique();

      const userId: Id<'users'> = user
        ? user._id
        : await ctx.db.insert('users', {
            email: args.email,
            name: args.name,
            role: args.role,
            enabled: true,
            userId: session.user.id,
            organizationId: orgId ?? undefined,
          });

      await ctx.db.insert('parkings', {
        name: args.parkingName,
        description: args.parkingDescription,
        location: args.parkingLocation,
        website: args.parkingWebsite,
        address: args.parkingAddress,
        userId,
        imageStorageId: args.imageStorageId,
        maxCapacity: args.maxCapacity,
        organizationId: orgId ?? undefined,
        unresolvedMakuleras: 0,
      });

      return success({
        success: true,
        message: `User ${args.email} and their parking created.`,
      });
    });
  },
});

export const getAvailabilityByParking = query({
  args: { parkingId: v.id('parkings') },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const parking = await ctx.db.get(args.parkingId);
    if (parking) requireOrgAccess(user, parking.organizationId);
    return await ctx.db
      .query('parkingAvailability')
      .withIndex('by_parkingId', (q) => q.eq('parkingId', args.parkingId))
      .order('desc')
      .collect();
  },
});

export const getAvailabilityByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    parkingId: v.optional(v.id('parkings')),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);

    let allAvailability;

    if (args.parkingId) {
      allAvailability = await ctx.db
        .query('parkingAvailability')
        .withIndex('by_parkingId', (q) =>
          q.eq('parkingId', args.parkingId as Id<'parkings'>),
        )
        .order('desc')
        .collect();
    } else if (orgId) {
      allAvailability = await ctx.db
        .query('parkingAvailability')
        .withIndex('by_organizationId', (q) =>
          q.eq('organizationId', orgId),
        )
        .order('desc')
        .collect();
    } else {
      allAvailability = await ctx.db
        .query('parkingAvailability')
        .order('desc')
        .collect();
    }

    return allAvailability.filter((availability) => {
      return (
        availability.startDate <= args.endDate &&
        availability.endDate >= args.startDate
      );
    });
  },
});

export const getUserParking = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return null;
    }

    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return null;
    }

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return null;
    }

    const imageUrl = parking.imageStorageId
      ? await ctx.storage.getUrl(parking.imageStorageId)
      : null;

    return { ...parking, imageUrl };
  },
});

export const getPublicParkingById = query({
  args: { parkingId: v.id('parkings') },
  handler: async (ctx, args) => {
    const parking = await ctx.db.get(args.parkingId);

    if (!parking) {
      return null;
    }

    const user = await ctx.db.get(parking.userId);

    const imageUrl = parking.imageStorageId
      ? await ctx.storage.getUrl(parking.imageStorageId)
      : null;

    return { ...parking, user, imageUrl };
  },
});

export const getPublicParkings = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const parkings = await ctx.db
      .query('parkings')
      .order('desc')
      .paginate(args.paginationOpts);

    const pageWithDetails = await Promise.all(
      parkings.page.map(async (parking) => {
        const user = await ctx.db.get(parking.userId);
        const imageUrl = parking.imageStorageId
          ? await ctx.storage.getUrl(parking.imageStorageId)
          : null;
        return { ...parking, user, imageUrl };
      }),
    );

    return { ...parkings, page: pageWithDetails };
  },
});

export const createAvailability = mutation({
  args: {
    parkingId: v.id('parkings'),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal('AVAILABLE'),
      v.literal('BOOKED'),
      v.literal('MAINTENANCE'),
    ),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    await ctx.db.insert('parkingAvailability', {
      ...args,
      organizationId: getOrganizationId(user) ?? undefined,
    });
    return { success: true };
  },
});

export const updateAvailability = mutation({
  args: {
    id: v.id('parkingAvailability'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('AVAILABLE'),
        v.literal('BOOKED'),
        v.literal('MAINTENANCE'),
      ),
    ),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...rest }) => {
    const user = await requireAdmin(ctx);
    const avail = await ctx.db.get(id);
    if (avail) requireOrgAccess(user, avail.organizationId);
    await ctx.db.patch(id, rest);
    return { success: true };
  },
});

export const deleteAvailability = mutation({
  args: { id: v.id('parkingAvailability') },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const avail = await ctx.db.get(args.id);
    if (avail) requireOrgAccess(user, avail.organizationId);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const getParkingInfo = query({
  args: { parkingId: v.optional(v.id('parkings')) },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return failure('Unauthenticated', ErrorCodes.UNAUTHORIZED);
    }

    let parking;

    if (args.parkingId) {
      parking = await ctx.db.get(args.parkingId);
    } else {
      parking = await ctx.db
        .query('parkings')
        .withIndex('by_userId', (q) => q.eq('userId', user._id))
        .unique();
    }

    if (!parking) {
      return failure('Parking not found', ErrorCodes.NOT_FOUND);
    }

    let imageUrl = '';
    if (parking.imageStorageId) {
      try {
        imageUrl = (await ctx.storage.getUrl(parking.imageStorageId)) || '';
      } catch {
        imageUrl = '';
      }
    }

    return success({ ...parking, imageUrl });
  },
});

export const updateParkingInfo = mutation({
  args: {
    parkingId: v.id('parkings'),
    workingHours: v.optional(
      v.array(
        v.object({
          day: v.string(),
          open: v.string(),
          close: v.string(),
          closed: v.optional(v.boolean()),
        }),
      ),
    ),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CustomResponse<{ success: boolean }>> => {
    const user = await requireAdminOrEmployee(ctx);

    const parking = await ctx.db.get(args.parkingId);
    if (!parking) return failure('Parking not found', ErrorCodes.NOT_FOUND);
    requireOrgAccess(user, parking.organizationId);

    if (args.maxCapacity !== undefined) {
      const currentVehicles = await ctx.db
        .query('vehicles')
        .withIndex('by_parkingId', (q) => q.eq('parkingId', args.parkingId))
        .collect();

      if (currentVehicles.length > args.maxCapacity) {
        return failure(
          `Cannot set capacity to ${args.maxCapacity}. Parking already has ${currentVehicles.length} vehicles.`,
          ErrorCodes.CONFLICT,
        );
      }
    }

    const { parkingId, ...updates } = args;
    await ctx.db.patch(parkingId, updates);

    return success({ success: true });
  },
});

export const deleteParking = mutation({
  args: { id: v.id('parkings') },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const parking = await ctx.db.get(args.id);
    if (!parking) throw new Error('Parking not found');
    if (!verifyOrgOwnership(user, parking.organizationId)) throw new AdminAuthError();
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const deleteOrphanedParkings = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);

    let allParkings;
    if (orgId) {
      allParkings = await ctx.db
        .query('parkings')
        .withIndex('by_organizationId', (q) =>
          q.eq('organizationId', orgId),
        )
        .collect();
    } else {
      allParkings = await ctx.db.query('parkings').collect();
    }

    let allUsers;
    if (orgId) {
      allUsers = await ctx.db
        .query('users')
        .withIndex('by_organizationId', (q) =>
          q.eq('organizationId', orgId),
        )
        .collect();
    } else {
      allUsers = await ctx.db.query('users').collect();
    }

    const userIds = new Set(allUsers.map((u) => u._id));

    const orphanedParkings = allParkings.filter(
      (parking) => !userIds.has(parking.userId),
    );

    const deletedCount = orphanedParkings.length;

    await Promise.all(orphanedParkings.map((p) => ctx.db.delete(p._id)));

    return { success: true, deletedCount };
  },
});
