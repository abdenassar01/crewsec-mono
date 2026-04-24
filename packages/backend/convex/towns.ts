import { v } from 'convex/values';

import { query } from './_generated/server';
import { getAuthenticatedUser, getOrganizationId } from './auth/helpers';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    const orgId = getOrganizationId(user);
    if (orgId) {
      return await ctx.db
        .query('towns')
        .withIndex('by_organizationId', (q) => q.eq('organizationId', orgId))
        .order('asc')
        .collect();
    }
    return await ctx.db.query('towns').order('asc').collect();
  },
});

export const get = query({
  args: { id: v.id('towns') },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);
    return await ctx.db.get(args.id);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const orgId = getOrganizationId(user);

    if (!args.query) {
      if (orgId) {
        return await ctx.db
          .query('towns')
          .withIndex('by_organizationId', (q) =>
            q.eq('organizationId', orgId),
          )
          .order('asc')
          .collect();
      }
      return await ctx.db.query('towns').order('asc').collect();
    }
    let results = await ctx.db
      .query('towns')
      .withSearchIndex('by_label', (q) => q.search('label', args.query))
      .collect();
    if (orgId) {
      results = results.filter((t) => t.organizationId === orgId);
    }
    return results;
  },
});
