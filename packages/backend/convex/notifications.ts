import { PushNotifications } from '@convex-dev/expo-push-notifications';
import { v } from 'convex/values';

import { components } from './_generated/api';
import { mutation, query } from './_generated/server';
import { getAuthenticatedUser } from './auth/helpers';

const pushNotifications = new PushNotifications(components.pushNotifications, {
  logLevel: 'DEBUG',
});

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
      // Update lastUsed timestamp
      await ctx.db.patch(existing._id, {
        lastUsed: Date.now(),
        deviceId: args.deviceId ?? existing.deviceId,
      });
    } else {
      // Record new token with the package
      await pushNotifications.recordToken(ctx, {
        userId: user._id,
        pushToken: args.token,
      });

      // Also store additional metadata
      const newEntries = await ctx.db
        .query('pushNotificationParams')
        .withIndex('by_userId_and_token', (q) =>
          q.eq('userId', user._id).eq('expoPushToken', args.token),
        )
        .collect();

      if (newEntries.length > 0) {
        await ctx.db.patch(newEntries[0]._id, {
          deviceId: args.deviceId,
          lastUsed: Date.now(),
        });
      }
    }
  },
});

// Get all push notification tokens for the current user
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

// Remove a specific push notification token
export const removePushNotificationToken = mutation({
  args: { tokenId: v.id('pushNotificationParams') },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      throw Error('Not Authenticated');
    }

    // Verify the token belongs to the user
    const token = await ctx.db.get(args.tokenId);
    if (!token || token.userId !== user._id) {
      throw Error('Token not found or not authorized');
    }

    // First remove through the package
    await pushNotifications.deleteNotificationsForUser(ctx, {
      userId: user._id,
    });

    // Then delete from our table
    await ctx.db.delete(args.tokenId);
  },
});

export const sendPushNotification = mutation({
  args: { title: v.string(), to: v.id('users'), body: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await pushNotifications.sendPushNotification(ctx, {
      userId: args.to,
      notification: {
        title: args.title,
        body: args.body,
      },
    });
  },
});

export const sendPushNotificationToAdmins = mutation({
  args: { title: v.string(), body: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admins = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'ADMIN'))
      .collect();

    await Promise.all(
      admins.map((admin) =>
        pushNotifications.sendPushNotification(ctx, {
          userId: admin._id,
          notification: { title: args.title, body: args.body },
        }),
      ),
    );

    return 'Notification sent to admins';
  },
});

export const sendPushNotificationToManagers = mutation({
  args: { title: v.string(), body: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admins = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'ADMIN'))
      .collect();

    const employees = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'EMPLOYEE'))
      .collect();

    const managers = [...admins, ...employees];

    await Promise.all(
      managers.map((manager) =>
        pushNotifications.sendPushNotification(ctx, {
          userId: manager._id,
          notification: { title: args.title, body: args.body },
        }),
      ),
    );

    return 'Notification sent to admins and employees';
  },
});
