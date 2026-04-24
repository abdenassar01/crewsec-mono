import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import {
  getOrganizationId,
  requireAdmin,
  requireSuperAdmin,
  verifyOrgOwnership,
} from './auth/helpers';
import { type CustomResponse, ErrorCodes, failure, success } from './util';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAdmin(ctx);

    if (user.role === 'SUPER_ADMIN') {
      return await ctx.db.query('organizations').order('desc').collect();
    }

    const orgId = getOrganizationId(user);
    if (!orgId) return [];

    const org = await ctx.db.get(orgId);
    return org ? [org] : [];
  },
});

export const getById = query({
  args: { id: v.id('organizations') },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const user = await requireAdmin(ctx);

    if (!verifyOrgOwnership(user, args.id)) {
      return failure('Not authorized to access this organization', ErrorCodes.FORBIDDEN);
    }

    const org = await ctx.db.get(args.id);
    if (!org) {
      return failure('Organization not found', ErrorCodes.NOT_FOUND);
    }

    const users = await ctx.db
      .query('users')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.id),
      )
      .collect();

    const parkings = await ctx.db
      .query('parkings')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.id),
      )
      .collect();

    let logoUrl = '';
    if (org.logoStorageId) {
      try {
        logoUrl = (await ctx.storage.getUrl(org.logoStorageId)) || '';
      } catch {
        logoUrl = '';
      }
    }

    return success({
      ...org,
      logoUrl,
      userCount: users.filter((u) => u.enabled).length,
      parkingCount: parkings.length,
    });
  },
});

export const getMyOrg = query({
  args: {},
  handler: async (ctx): Promise<CustomResponse<any>> => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);
    if (!orgId) {
      return failure('No organization associated with this account', ErrorCodes.NOT_FOUND);
    }

    const org = await ctx.db.get(orgId);
    if (!org) {
      return failure('Organization not found', ErrorCodes.NOT_FOUND);
    }

    const users = await ctx.db
      .query('users')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', orgId),
      )
      .collect();

    const parkings = await ctx.db
      .query('parkings')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', orgId),
      )
      .collect();

    let logoUrl = '';
    if (org.logoStorageId) {
      try {
        logoUrl = (await ctx.storage.getUrl(org.logoStorageId)) || '';
      } catch {
        logoUrl = '';
      }
    }

    return success({
      ...org,
      logoUrl,
      userCount: users.filter((u) => u.enabled).length,
      parkingCount: parkings.length,
    });
  },
});

export const getOrgStats = query({
  args: { id: v.id('organizations') },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const user = await requireAdmin(ctx);

    if (!verifyOrgOwnership(user, args.id)) {
      return failure('Not authorized', ErrorCodes.FORBIDDEN);
    }

    const org = await ctx.db.get(args.id);
    if (!org) {
      return failure('Organization not found', ErrorCodes.NOT_FOUND);
    }

    const users = await ctx.db
      .query('users')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.id),
      )
      .collect();

    const parkings = await ctx.db
      .query('parkings')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.id),
      )
      .collect();

    const vehicles = await ctx.db
      .query('vehicles')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.id),
      )
      .collect();

    const controlFees = await ctx.db
      .query('controlFees')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.id),
      )
      .collect();

    const violations = await ctx.db
      .query('canceledViolations')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.id),
      )
      .collect();

    return success({
      userCount: users.filter((u) => u.enabled).length,
      parkingCount: parkings.length,
      vehicleCount: vehicles.length,
      controlFeeCount: controlFees.length,
      violationCount: violations.length,
    });
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal('ACTIVE'),
        v.literal('INACTIVE'),
        v.literal('TRIAL'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    return await ctx.db.insert('organizations', {
      name: args.name,
      description: args.description,
      address: args.address,
      phone: args.phone,
      email: args.email,
      website: args.website,
      subscriptionStatus: args.subscriptionStatus ?? 'TRIAL',
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('organizations'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    logoStorageId: v.optional(v.id('_storage')),
    subscriptionStatus: v.optional(
      v.union(
        v.literal('ACTIVE'),
        v.literal('INACTIVE'),
        v.literal('TRIAL'),
      ),
    ),
  },
  handler: async (ctx, args): Promise<CustomResponse<{ success: boolean }>> => {
    const user = await requireAdmin(ctx);

    if (!verifyOrgOwnership(user, args.id)) {
      return failure('Not authorized to update this organization', ErrorCodes.FORBIDDEN);
    }

    const { id, ...rest } = args;
    const org = await ctx.db.get(id);
    if (!org) {
      return failure('Organization not found', ErrorCodes.NOT_FOUND);
    }

    if (user.role !== 'SUPER_ADMIN') {
      delete rest.subscriptionStatus;
    }

    await ctx.db.patch(id, rest);
    return success({ success: true });
  },
});

export const remove = mutation({
  args: { id: v.id('organizations') },
  handler: async (ctx, args): Promise<CustomResponse<{ success: boolean }>> => {
    await requireSuperAdmin(ctx);

    const org = await ctx.db.get(args.id);
    if (!org) {
      return failure('Organization not found', ErrorCodes.NOT_FOUND);
    }

    const users = await ctx.db
      .query('users')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.id),
      )
      .collect();

    for (const user of users) {
      if (user.enabled) {
        await ctx.db.patch(user._id, { enabled: false });
      }
    }

    await ctx.db.delete(args.id);
    return success({ success: true });
  },
});

export const getUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
