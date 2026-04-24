import { v } from 'convex/values';

import { query } from './_generated/server';
import { mutation } from './_generated/server';
import type { Id } from './_generated/dataModel';
import {
  getAuthenticatedUser,
  getOrganizationId,
  requireAdmin,
} from './auth/helpers';
import { type CustomResponse, ErrorCodes, failure, success } from './util';

export const insertBatch = mutation({
  args: {
    vehicles: v.array(
      v.object({
        reference: v.string(),
        name: v.string(),
        leaveDate: v.number(),
        joinDate: v.number(),
        parkingId: v.id('parkings'),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const results: Array<{ skipped?: boolean; success?: boolean; id?: Id<'vehicles'>; reference: string; error?: string }> = [];
    for (const vehicle of args.vehicles) {
      try {
        const existing = await ctx.db
          .query('vehicles')
          .withIndex('by_reference', (q) =>
            q.eq('reference', vehicle.reference),
          )
          .filter((q) => q.eq(q.field('parkingId'), vehicle.parkingId))
          .first();

        if (existing) {
          results.push({ skipped: true, reference: vehicle.reference });
          continue;
        }

        const id = await ctx.db.insert('vehicles', {
          ...vehicle,
          organizationId: getOrganizationId(user) ?? undefined,
        });
        results.push({ success: true, id, reference: vehicle.reference });
      } catch (error) {
        results.push({ error: String(error), reference: vehicle.reference });
      }
    }
    return results;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);

    let vehicles;
    if (orgId) {
      vehicles = await ctx.db
        .query('vehicles')
        .withIndex('by_organizationId', (q) =>
          q.eq('organizationId', orgId),
        )
        .order('desc')
        .collect();
    } else {
      vehicles = await ctx.db.query('vehicles').order('desc').collect();
    }

    const pageWithParking = await Promise.all(
      vehicles.map(async (vehicle) => {
        const parking = await ctx.db.get(vehicle.parkingId);
        return { ...vehicle, parking: parking || undefined };
      }),
    );

    return { page: pageWithParking };
  },
});

/**
 * Search for vehicles by reference, optionally filtered by parkingId.
 */
export const search = query({
  args: {
    query: v.string(),
    parkingId: v.optional(v.id('parkings')),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return [];
    }

    const orgId = getOrganizationId(user);

    if (args.query === '') {
      if (args.parkingId) {
        return ctx.db
          .query('vehicles')
          .withIndex('by_parkingId', (q) => q.eq('parkingId', args.parkingId!))
          .filter((q) => q.gte(q.field('leaveDate'), now))
          .collect();
      }
      if (orgId) {
        return ctx.db
          .query('vehicles')
          .withIndex('by_organizationId', (q) =>
            q.eq('organizationId', orgId),
          )
          .filter((q) => q.gte(q.field('leaveDate'), now))
          .collect();
      }
      return ctx.db.query('vehicles').collect();
    }

    if (args.parkingId) {
      return await ctx.db
        .query('vehicles')
        .withSearchIndex('by_reference_search', (q) =>
          q.search('reference', args.query).eq('parkingId', args.parkingId!),
        )
        .collect();
    }
    return await ctx.db
      .query('vehicles')
      .withSearchIndex('by_reference_search', (q) =>
        q.search('reference', args.query),
      )
      .collect();
  },
});

export const searchWithDetails = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return { page: [], continueCursor: null, isDone: true };
    }

    const orgId = getOrganizationId(user);

    let vehicles;
    if (args.query === '') {
      if (orgId) {
        vehicles = await ctx.db
          .query('vehicles')
          .withIndex('by_organizationId', (q) =>
            q.eq('organizationId', orgId),
          )
          .order('desc')
          .take(20);
      } else {
        vehicles = await ctx.db.query('vehicles').order('desc').take(20);
      }
    } else {
      vehicles = await ctx.db
        .query('vehicles')
        .withSearchIndex('by_reference_search', (q) =>
          q.search('reference', args.query),
        )
        .collect();
    }

    const pageWithParking = await Promise.all(
      vehicles.map(async (vehicle) => {
        const parking = await ctx.db.get(vehicle.parkingId);
        return { ...vehicle, parking: parking || undefined };
      }),
    );

    return { page: pageWithParking, continueCursor: null, isDone: true };
  },
});

/**
 * Get vehicle details by ID.
 */
export const getById = query({
  args: { id: v.id('vehicles') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a new vehicle record.
 */
export const create = mutation({
  args: {
    reference: v.string(),
    name: v.string(),
    leaveDate: v.number(),
    joinDate: v.number(),
    parkingId: v.id('parkings'),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    await ctx.db.insert('vehicles', {
      ...args,
      organizationId: getOrganizationId(user) ?? undefined,
    });
  },
});

/**
 * Update an existing vehicle's details.
 */
export const update = mutation({
  args: {
    id: v.id('vehicles'),
    reference: v.optional(v.string()),
    name: v.optional(v.string()),
    leaveDate: v.optional(v.number()),
    joinDate: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, rest);
  },
});

/**
 * Delete a vehicle record.
 */
export const deleteVehicle = mutation({
  args: { id: v.id('vehicles') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

/**
 * Delete orphaned vehicles (vehicles with missing parking references)
 */
export const deleteOrphanedVehicles = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);

    let allVehicles;
    if (orgId) {
      allVehicles = await ctx.db
        .query('vehicles')
        .withIndex('by_organizationId', (q) =>
          q.eq('organizationId', orgId),
        )
        .collect();
    } else {
      allVehicles = await ctx.db.query('vehicles').collect();
    }

    const allParkings = await ctx.db.query('parkings').collect();
    const parkingIds = new Set(allParkings.map((p) => p._id));

    const orphanedVehicles = allVehicles.filter(
      (vehicle) => !parkingIds.has(vehicle.parkingId),
    );

    const deletedCount = orphanedVehicles.length;

    for (const vehicle of orphanedVehicles) {
      await ctx.db.delete(vehicle._id);
    }

    return { success: true, deletedCount };
  },
});

export const getMyVehicles = query({
  args: {
    query: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return failure('User profile not found', ErrorCodes.NOT_FOUND);
    }

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return failure(
        'This account is not associated to a parking',
        ErrorCodes.FORBIDDEN,
      );
    }

    const now = Date.now();

    let vehicles;
    if (args.query) {
      vehicles = await ctx.db
        .query('vehicles')
        .withSearchIndex('by_reference_search', (q) =>
          q.search('reference', args.query!).eq('parkingId', parking._id),
        )
        .collect();
    } else {
      vehicles = await ctx.db
        .query('vehicles')
        .withIndex('by_parkingId', (q) => q.eq('parkingId', parking._id))
        .filter((q) => q.gte(q.field('leaveDate'), now))
        .order('desc')
        .collect();
    }

    return success(vehicles);
  },
});

export const getMyVehicleById = query({
  args: { id: v.id('vehicles') },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return failure('User profile not found', ErrorCodes.NOT_FOUND);
    }

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return failure('Parking not found for this user', ErrorCodes.NOT_FOUND);
    }

    const vehicle = await ctx.db.get(args.id);

    if (!vehicle || vehicle.parkingId !== parking._id) {
      return failure(
        'Vehicle not found or access denied',
        ErrorCodes.FORBIDDEN,
      );
    }

    return success(vehicle);
  },
});

export const createMyVehicle = mutation({
  args: {
    reference: v.string(),
    name: v.string(),
    leaveDate: v.number(),
    joinDate: v.number(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<CustomResponse<{ vehicleId: string }>> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return failure('User profile not found', ErrorCodes.NOT_FOUND);
    }

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return failure('Parking not found for this user', ErrorCodes.NOT_FOUND);
    }

    const vehicleId = await ctx.db.insert('vehicles', {
      ...args,
      parkingId: parking._id,
      organizationId: parking.organizationId ?? undefined,
    });

    return success({ vehicleId });
  },
});

export const updateMyVehicle = mutation({
  args: {
    id: v.id('vehicles'),
    reference: v.optional(v.string()),
    name: v.optional(v.string()),
    leaveDate: v.optional(v.number()),
    joinDate: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { id, ...rest },
  ): Promise<CustomResponse<{ success: boolean }>> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return failure('User profile not found', ErrorCodes.NOT_FOUND);
    }

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return failure('Parking not found for this user', ErrorCodes.NOT_FOUND);
    }

    const vehicle = await ctx.db.get(id);

    if (!vehicle || vehicle.parkingId !== parking._id) {
      return failure(
        'Vehicle not found or access denied',
        ErrorCodes.FORBIDDEN,
      );
    }

    await ctx.db.patch(id, rest);
    return success({ success: true });
  },
});

export const deleteMyVehicle = mutation({
  args: { id: v.id('vehicles') },
  handler: async (ctx, args): Promise<CustomResponse<{ success: boolean }>> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return failure('User profile not found', ErrorCodes.NOT_FOUND);
    }

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return failure('Parking not found for this user', ErrorCodes.NOT_FOUND);
    }

    const vehicle = await ctx.db.get(args.id);

    if (!vehicle || vehicle.parkingId !== parking._id) {
      return failure(
        'Vehicle not found or access denied',
        ErrorCodes.FORBIDDEN,
      );
    }

    await ctx.db.delete(args.id);
    return success({ success: true });
  },
});
