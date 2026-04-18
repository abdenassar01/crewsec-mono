import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { getAuthenticatedUser } from './auth/helpers';

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await getAuthenticatedUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
export const getUrl = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});
