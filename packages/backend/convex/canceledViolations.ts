import { v } from 'convex/values';

import { api } from './_generated/api';
import { mutation, query } from './_generated/server';
import { authComponent } from './auth';
import { getAuthenticatedUser, requireAdmin } from './auth/helpers';
import { type CustomResponse, ErrorCodes, failure, success } from './util';

const causeType = v.union(v.literal('FELPARKERING'), v.literal('MAKULERA'));

export const list = query({
  args: {},
  handler: async (ctx): Promise<CustomResponse<any>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const violations = await ctx.db
      .query('canceledViolations')
      .order('desc')
      .collect();
    return success(violations);
  },
});

export const listForCause = query({
  args: { cause: causeType },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const violations = await ctx.db
      .query('canceledViolations')
      .withIndex('by_cause', (q) => q.eq('cause', args.cause))
      .collect();
    return success(violations);
  },
});

export const create = mutation({
  args: {
    reference: v.string(),
    cause: causeType,
    resolved: v.boolean(),
    parkingId: v.id('parkings'),
  },
  handler: async (
    ctx,
    args,
  ): Promise<CustomResponse<{ violationId: string }>> => {
    const authUser = await getAuthenticatedUser(ctx);

    const parking = await ctx.db.get(args.parkingId);

    if (!(authUser?.role === 'ADMIN' || parking?.userId === authUser?._id)) {
      return failure('Not Authorized', ErrorCodes.FORBIDDEN);
    }

    const violationId = await ctx.db.insert('canceledViolations', {
      ...args,
      createdAt: Date.now(),
    });

    try {
      await ctx.runMutation(api.notifications.sendPushNotificationToManagers, {
        title: 'Ny avbruten parkering',
        body: `En parkering har blitt avbrutt for referanse ${args.reference}. parking: ${parking?.name || 'Ukjent'}`,
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }

    if (!args.resolved && parking) {
      if (args.cause === 'FELPARKERING') {
        await ctx.db.patch(args.parkingId, {
          unresolvedFelparkering: (parking.unresolvedFelparkering || 0) + 1,
        });
      } else if (args.cause === 'MAKULERA') {
        await ctx.db.patch(args.parkingId, {
          unresolvedMakuleras: (parking.unresolvedMakuleras || 0) + 1,
        });
      }
    }

    return success({ violationId });
  },
});

export const update = mutation({
  args: {
    id: v.id('canceledViolations'),
    reference: v.optional(v.string()),
    cause: v.optional(causeType),
    resolved: v.optional(v.boolean()),
    parkingId: v.optional(v.id('parkings')),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id('canceledViolations') },
  handler: async (ctx, args): Promise<CustomResponse<{ success: boolean }>> => {
    const authUser = await getAuthenticatedUser(ctx);

    const violation = await ctx.db.get(args.id);

    if (!violation) {
      return failure('Violation not found', ErrorCodes.NOT_FOUND);
    }

    const parking = await ctx.db.get(violation.parkingId);

    if (!(authUser?.role === 'ADMIN' || parking?.userId === authUser?._id)) {
      return failure('Not Authorized', ErrorCodes.FORBIDDEN);
    }

    await ctx.db.delete(args.id);
    return success({ success: true });
  },
});

/**
 * Delete orphaned canceledViolations (violations with missing parking references)
 */
export const deleteOrphanedCanceledViolations = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    // Get all canceled violations
    const allViolations = await ctx.db.query('canceledViolations').collect();

    // Get all parking IDs
    const allParkings = await ctx.db.query('parkings').collect();
    const parkingIds = new Set(allParkings.map((p) => p._id));

    // Find and delete violations with no valid parking
    const orphanedViolations = allViolations.filter(
      (violation) => !parkingIds.has(violation.parkingId),
    );

    const deletedCount = orphanedViolations.length;

    for (const violation of orphanedViolations) {
      await ctx.db.delete(violation._id);
    }

    return { success: true, deletedCount };
  },
});

export const getById = query({
  args: { id: v.id('canceledViolations') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const getByParkingId = query({
  args: { parkingId: v.id('parkings') },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const violations = await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId', (q) => q.eq('parkingId', args.parkingId))
      .collect();
    return success(violations);
  },
});

export const getByParkingIdAndCause = query({
  args: {
    parkingId: v.id('parkings'),
    cause: causeType,
  },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const violations = await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId_and_cause', (q) =>
        q.eq('parkingId', args.parkingId).eq('cause', args.cause),
      )
      .collect();
    return success(violations);
  },
});

export const getByMyParkingIdAndCause = query({
  args: {
    cause: causeType,
  },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const authUser = await getAuthenticatedUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    if (authUser.role !== 'CLIENT')
      return failure('Not allowed to call this', ErrorCodes.FORBIDDEN);

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', authUser._id))
      .unique();

    if (!parking)
      return failure(
        'You have no parking associated with this user',
        ErrorCodes.NOT_FOUND,
      );

    const violations = await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId_and_cause', (q) =>
        q.eq('parkingId', parking?._id).eq('cause', args.cause),
      )
      .collect();
    return success(violations);
  },
});

export const getUnresolvedByParkingId = query({
  args: { parkingId: v.id('parkings') },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const violations = await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId_and_resolved', (q) =>
        q.eq('parkingId', args.parkingId).eq('resolved', false),
      )
      .collect();
    return success(violations);
  },
});

export const getUnresolvedByParkingIdAndCause = query({
  args: {
    parkingId: v.id('parkings'),
    cause: causeType,
  },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const violations = await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId_and_cause', (q) =>
        q.eq('parkingId', args.parkingId).eq('cause', args.cause),
      )
      .filter((q) => q.eq(q.field('resolved'), false))
      .collect();
    return success(violations);
  },
});

export const getUnresolvedCount = query({
  args: { cause: causeType },
  handler: async (ctx, args): Promise<CustomResponse<{ count: number }>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const count = await ctx.db
      .query('canceledViolations')
      .withIndex('by_cause', (q) => q.eq('cause', args.cause))
      .collect();
    return success({
      count: count.filter((item) => item.resolved !== true).length,
    });
  },
});

export const resolveViolation = mutation({
  args: {
    id: v.id('canceledViolations'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CustomResponse<{ success: boolean }>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    // Get the current user from Convex users table
    const currentUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', user.subject))
      .unique();

    if (!currentUser) {
      return failure('User not found', ErrorCodes.NOT_FOUND);
    }

    // Get the violation to check if it was previously unresolved
    const violation = await ctx.db.get(args.id);
    if (!violation) {
      return failure('Violation not found', ErrorCodes.NOT_FOUND);
    }

    // Update the violation
    await ctx.db.patch(args.id, {
      resolved: true,
      notes: args.notes,
    });

    // Update parking count if it was previously unresolved
    if (!violation.resolved) {
      const parking = await ctx.db.get(violation.parkingId);
      if (parking) {
        if (violation.cause === 'FELPARKERING') {
          await ctx.db.patch(violation.parkingId, {
            unresolvedFelparkering: Math.max(
              0,
              (parking.unresolvedFelparkering || 0) - 1,
            ),
          });
        } else if (violation.cause === 'MAKULERA') {
          await ctx.db.patch(violation.parkingId, {
            unresolvedMakuleras: Math.max(
              0,
              (parking.unresolvedMakuleras || 0) - 1,
            ),
          });
        }
      }
    }

    return success({ success: true });
  },
});

export const unresolvedByCause = query({
  args: { cause: causeType },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const canceledByCause = await ctx.db
      .query('canceledViolations')
      .withIndex('by_cause', (q) => q.eq('cause', args.cause))
      .collect();

    return success(canceledByCause.filter((item) => item.resolved !== true));
  },
});
