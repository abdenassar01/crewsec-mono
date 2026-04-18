import { v } from 'convex/values';

import { query } from './_generated/server';
import { getAuthenticatedUser } from './auth/helpers';

// Query to get all towns
export const list = query({
  args: {},
  handler: async (ctx) => {
    await getAuthenticatedUser(ctx);
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

// Query to get all towns
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);

    if (!args.query) return await ctx.db.query('towns').order('asc').collect();
    return await ctx.db
      .query('towns')
      .withSearchIndex('by_label', (q) => q.search('label', args.query))
      .collect();
  },
});
