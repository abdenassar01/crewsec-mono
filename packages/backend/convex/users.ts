import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { hashPassword } from 'better-auth/crypto';

import { mutation, query } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { authComponent, createAuth } from './auth';
import { components } from './_generated/api';
import {
  AdminAuthError,
  getAuthenticatedUser,
  requireAdmin,
} from './auth/helpers';
import { type CustomResponse, ErrorCodes, failure, success } from './util';

// Query to get all users from Convex users table
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const users = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('enabled'), true))
      .order('desc')
      .paginate(args.paginationOpts);
    return users;
  },
});

export const getUsersByRole = query({
  args: {
    role: v.union(
      v.literal('ADMIN'),
      v.literal('EMPLOYEE'),
      v.literal('CLIENT'),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const users = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', args.role))
      .collect();

    const usersWithAvatarUrls = await Promise.all(
      users
        .filter((user) => user.enabled)
        .map(async (user) => ({
          ...user,
          avatarUrl: user.avatar
            ? (await ctx.storage.getUrl(user.avatar)) || ''
            : '',
        })),
    );

    return usersWithAvatarUrls;
  },
});

// Query to get current user's profile from Convex users table
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    let user = await getAuthenticatedUser(ctx);

    if (!user) {
      return null;
    }

    if (!user.enabled) {
      return null;
    }

    let avatarUrl = '';
    if (user.avatar) {
      try {
        avatarUrl = (await ctx.storage.getUrl(user.avatar)) || '';
      } catch (error) {
        console.error('Failed to get avatar URL:', error);
        avatarUrl = '';
      }
    }

    return { ...user, avatarUrl };
  },
});

// Query to get user by ID from Convex users table
export const getById = query({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args): Promise<CustomResponse<typeof user>> => {
    if (!args.userId) {
      return failure('userId is required', ErrorCodes.BAD_REQUEST);
    }
    try {
      await requireAdmin(ctx);
    } catch (e) {
      if (e instanceof AdminAuthError) {
        return failure('Admin role required', ErrorCodes.FORBIDDEN);
      }
      throw e;
    }
    const user = (await ctx.db.get(args.userId)) as Doc<'users'> | null;

    if (!user) {
      return failure('User not found', ErrorCodes.NOT_FOUND);
    }

    if (!user.enabled) {
      return failure('User is disabled', ErrorCodes.FORBIDDEN);
    }

    return success(user);
  },
});

// Function to sync user from Better Auth to Convex users table
export const syncUserToTable = async (ctx: any, betterAuthUser: any) => {
  // Check if user already exists
  const existingUser = await ctx.db
    .query('users')
    .withIndex('by_email', (q: any) => q.eq('email', betterAuthUser.email))
    .unique();

  if (existingUser) {
    return existingUser._id;
  }

  // Create new user in Convex users table
  const userId = await ctx.db.insert('users', {
    email: betterAuthUser.email,
    name: betterAuthUser.name || betterAuthUser.email.split('@')[0],
    role: betterAuthUser.role || 'CLIENT',
    enabled: betterAuthUser.enabled ?? true,
    userId: betterAuthUser.id, // Store the Better Auth user ID
  });

  return userId;
};

export const updateUserPassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await createAuth(ctx).api.changePassword({
      body: {
        currentPassword: args.currentPassword,
        newPassword: args.newPassword,
      },
      headers: await authComponent.getHeaders(ctx),
    });
  },
});

export const getByAuthUserId = query({
  args: { authUserId: v.string() },
  handler: async (ctx, args): Promise<CustomResponse<typeof user>> => {
    try {
      await requireAdmin(ctx);
    } catch (e) {
      if (e instanceof AdminAuthError) {
        return failure('Admin role required', ErrorCodes.FORBIDDEN);
      }
      throw e;
    }
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.authUserId))
      .unique();

    if (!user) {
      return failure('User not found', ErrorCodes.NOT_FOUND);
    }

    if (!user.enabled) {
      return failure('User is disabled', ErrorCodes.FORBIDDEN);
    }

    return success(user);
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    avatar: v.optional(v.id('_storage')),
    ocr: v.optional(v.boolean()),
    role: v.union(
      v.literal('ADMIN'),
      v.literal('EMPLOYEE'),
      v.literal('CLIENT'),
    ),
  },
  handler: async (
    ctx,
    args,
  ): Promise<CustomResponse<{ userId: typeof userId }>> => {
    try {
      await requireAdmin(ctx);
    } catch (e) {
      if (e instanceof AdminAuthError) {
        return failure('Admin role required', ErrorCodes.FORBIDDEN);
      }
      throw e;
    }

    const session = await createAuth(ctx).api.signUpEmail({
      body: {
        email: args.email,
        password: args.password,
        name: args.name,
      },
    });

    if (!session?.user?.id) {
      return failure(
        'Failed to create user in Better Auth',
        ErrorCodes.INTERNAL_SERVER_ERROR,
      );
    }

    const userId = await ctx.db.insert('users', {
      email: args.email,
      name: args.name,
      role: args.role,
      avatar: args.avatar,
      ocr: args.ocr,
      enabled: true,
      userId: session.user.id,
    });

    return success({ userId });
  },
});

export const update = mutation({
  args: {
    userId: v.id('users'),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal('ADMIN'),
      v.literal('EMPLOYEE'),
      v.literal('CLIENT'),
    ),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, {
      email: args.email,
      name: args.name,
      phone: args.phone,
      role: args.role,
      enabled: args.enabled,
    });
  },
});

export const deleteUser = mutation({
  args: { userId: v.id('users') },
  handler: async (
    ctx,
    args,
  ): Promise<CustomResponse<{ userId: typeof args.userId }>> => {
    try {
      await requireAdmin(ctx);
    } catch (e) {
      if (e instanceof AdminAuthError) {
        return failure('Admin role required', ErrorCodes.FORBIDDEN);
      }
      throw e;
    }
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return failure('User not found', ErrorCodes.NOT_FOUND);
    }

    if (!user.enabled) {
      return failure('User already disabled', ErrorCodes.CONFLICT);
    }

    await ctx.db.patch(args.userId, { enabled: false });
    return success({ userId: args.userId });
  },
});

export const resetUserPassword = mutation({
  args: {
    userId: v.id('users'),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<CustomResponse<{ success: boolean }>> => {
    await requireAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      return failure('User not found', ErrorCodes.NOT_FOUND);
    }
    if (!user.userId) {
      return failure(
        'User does not have an associated auth userId',
        ErrorCodes.BAD_REQUEST,
      );
    }

    const hashedPassword = await hashPassword(args.newPassword);

    const accounts = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: 'account',
        where: [{ field: 'userId', value: user.userId }],
        paginationOpts: { numItems: 10, cursor: null },
      },
    );

    if (!accounts || accounts.page.length === 0) {
      return failure('No account found for user', ErrorCodes.NOT_FOUND);
    }

    const account = accounts.page.find(
      (a: { providerId?: string }) => a.providerId === 'credential',
    ) ?? accounts.page[0];

    await ctx.runMutation(components.betterAuth.adapter.updateOne, {
      input: {
        model: 'account',
        where: [{ field: 'accountId', value: account.accountId }],
        update: { password: hashedPassword },
      },
    });

    return success({ success: true });
  },
});
