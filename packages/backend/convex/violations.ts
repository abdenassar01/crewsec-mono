import { v } from 'convex/values';
import { query } from './_generated/server';
import { requireAdmin, getOrganizationId, requireOrgAccess } from './auth/helpers';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);
    if (orgId) {
      return await ctx.db
        .query('violations')
        .withIndex('by_organizationId', (q) => q.eq('organizationId', orgId))
        .order('asc')
        .collect();
    }
    return await ctx.db.query('violations').order('asc').collect();
  },
});

export const getViolationById = query({
  args: {
    id: v.id('violations'),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const violation = await ctx.db.get(args.id);
    if (violation) requireOrgAccess(user, violation.organizationId);
    return violation;
  },
});
