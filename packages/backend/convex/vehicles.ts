import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getAuthenticatedUser, requireAdmin } from './auth/helpers';
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
    await requireAdmin(ctx);
    const results = [];
    for (const vehicle of args.vehicles) {
      try {
        // Skip if already exists
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

        const id = await ctx.db.insert('vehicles', vehicle);
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
    await requireAdmin(ctx);
    const vehicles = await ctx.db.query('vehicles').order('desc').collect();

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

    if (args.query === '') {
      if (args.parkingId) {
        return ctx.db
          .query('vehicles')
          .withIndex('by_parkingId', (q) => q.eq('parkingId', args.parkingId!))
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

    let vehicles;
    if (args.query === '') {
      vehicles = await ctx.db.query('vehicles').order('desc').take(20);
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
    await requireAdmin(ctx);
    await ctx.db.insert('vehicles', args);
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
    await requireAdmin(ctx);
    // Get all vehicles
    const allVehicles = await ctx.db.query('vehicles').collect();

    // Get all parking IDs
    const allParkings = await ctx.db.query('parkings').collect();
    const parkingIds = new Set(allParkings.map((p) => p._id));

    // Find and delete vehicles with no valid parking
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

    // Find the user in our users table
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return failure('User profile not found', ErrorCodes.NOT_FOUND);
    }

    // Find user's parking
    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return failure('Parking not found for this user', ErrorCodes.NOT_FOUND);
    }

    const vehicle = await ctx.db.get(args.id);

    // Ensure the vehicle belongs to the user's parking
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

    // Find the user in our users table
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return failure('User profile not found', ErrorCodes.NOT_FOUND);
    }

    // Find user's parking
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

    // Find the user in our users table
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return failure('User profile not found', ErrorCodes.NOT_FOUND);
    }

    // Find user's parking
    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return failure('Parking not found for this user', ErrorCodes.NOT_FOUND);
    }

    const vehicle = await ctx.db.get(id);

    // Ensure the vehicle belongs to the user's parking
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

    // Find the user in our users table
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return failure('User profile not found', ErrorCodes.NOT_FOUND);
    }

    // Find user's parking
    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return failure('Parking not found for this user', ErrorCodes.NOT_FOUND);
    }

    const vehicle = await ctx.db.get(args.id);

    // Ensure the vehicle belongs to the user's parking
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
