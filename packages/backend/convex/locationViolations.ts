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
        .query('locationViolations')
        .withIndex('by_organizationId', (q) => q.eq('organizationId', orgId))
        .order('asc')
        .collect();
    }
    return await ctx.db.query('locationViolations').order('asc').collect();
  },
});

export const getViolationById = query({
  args: {
    id: v.id('locationViolations'),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const lv = await ctx.db.get(args.id);
    if (lv) requireOrgAccess(user, lv.organizationId);
    return lv;
  },
});
