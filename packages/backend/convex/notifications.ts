import { v } from 'convex/values';

import { api } from './_generated/api';
import { action, mutation, query } from './_generated/server';
import { getAuthenticatedUser } from './auth/helpers';

export const recordPushNotificationToken = mutation({
  args: {
    token: v.string(),
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      throw Error(
        '[Debug | notifications:recordPushNotification()]: Not Authenticated',
      );
    }

    const existing = await ctx.db
      .query('pushNotificationParams')
      .withIndex('by_userId_and_token', (q) =>
        q.eq('userId', user._id).eq('expoPushToken', args.token),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastUsed: Date.now(),
        deviceId: args.deviceId ?? existing.deviceId,
      });
    } else {
      await ctx.db.insert('pushNotificationParams', {
        userId: user._id,
        expoPushToken: args.token,
        deviceId: args.deviceId,
        lastUsed: Date.now(),
      });
    }
  },
});

export const getMyPushTokens = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return [];
    }

    const tokens = await ctx.db
      .query('pushNotificationParams')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    return tokens.map((t) => ({
      _id: t._id,
      expoPushToken: t.expoPushToken,
      deviceId: t.deviceId,
      lastUsed: t.lastUsed,
    }));
  },
});

export const removePushNotificationToken = mutation({
  args: { tokenId: v.id('pushNotificationParams') },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      throw Error('Not Authenticated');
    }

    const token = await ctx.db.get(args.tokenId);
    if (!token || token.userId !== user._id) {
      throw Error('Token not found or not authorized');
    }

    await ctx.db.delete(args.tokenId);
  },
});

export const getTokensForUserIds = query({
  args: { userIds: v.array(v.id('users')) },
  handler: async (ctx, args) => {
    const allTokens: string[] = [];
    for (const userId of args.userIds) {
      const tokens = await ctx.db
        .query('pushNotificationParams')
        .withIndex('by_userId', (q) => q.eq('userId', userId))
        .collect();
      for (const t of tokens) {
        allTokens.push(t.expoPushToken);
      }
    }
    return allTokens;
  },
});

export const getAdminUserIds = query({
  handler: async (ctx) => {
    const admins = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'ADMIN'))
      .collect();
    return admins.map((a) => a._id);
  },
});

export const getManagerUserIds = query({
  handler: async (ctx) => {
    const admins = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'ADMIN'))
      .collect();

    const employees = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'EMPLOYEE'))
      .collect();

    return [...admins, ...employees].map((m) => m._id);
  },
});

async function sendToExpoPushAPI(
  tokens: string[],
  title: string,
  body?: string,
) {
  if (tokens.length === 0) return;

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default' as const,
    title,
    body: body ?? '',
  }));

  const CHUNK_SIZE = 100;
  const chunks: (typeof messages)[] = [];
  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    chunks.push(messages.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(chunk),
    });
  }
}

export const sendPushNotification = action({
  args: {
    title: v.string(),
    to: v.id('users'),
    body: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tokens = await ctx.runQuery(api.notifications.getTokensForUserIds, {
      userIds: [args.to],
    });
    await sendToExpoPushAPI(tokens, args.title, args.body ?? undefined);
  },
});

export const sendPushNotificationToAdmins = action({
  args: { title: v.string(), body: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userIds = await ctx.runQuery(api.notifications.getAdminUserIds);
    const tokens = await ctx.runQuery(api.notifications.getTokensForUserIds, {
      userIds,
    });
    await sendToExpoPushAPI(tokens, args.title, args.body ?? undefined);

    return 'Notification sent to admins';
  },
});

export const sendPushNotificationToManagers = action({
  args: { title: v.string(), body: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userIds = await ctx.runQuery(api.notifications.getManagerUserIds);
    const tokens = await ctx.runQuery(api.notifications.getTokensForUserIds, {
      userIds,
    });
    await sendToExpoPushAPI(tokens, args.title, args.body ?? undefined);

    return 'Notification sent to admins and employees';
  },
});
