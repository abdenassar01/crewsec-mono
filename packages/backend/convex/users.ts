import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { hashPassword } from 'better-auth/crypto';

import { mutation, query } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { authComponent, createAuth } from './auth';
import { components } from './_generated/api';
import {
  getAuthenticatedUser,
  getOrganizationId,
  requireAdmin,
  verifyOrgOwnership,
  withAdminCheck,
} from './auth/helpers';
import { type CustomResponse, ErrorCodes, failure, success } from './util';

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);

    if (orgId) {
      return await ctx.db
        .query('users')
        .withIndex('by_organizationId', (q) =>
          q.eq('organizationId', orgId),
        )
        .filter((q) => q.eq(q.field('enabled'), true))
        .order('desc')
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('enabled'), true))
      .order('desc')
      .paginate(args.paginationOpts);
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
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);

    const users = orgId
      ? await ctx.db
          .query('users')
          .withIndex('by_organizationId_and_role', (q) =>
            q.eq('organizationId', orgId).eq('role', args.role),
          )
          .collect()
      : await ctx.db
          .query('users')
          .withIndex('by_role', (q) => q.eq('role', args.role))
          .collect();

    const enabledUsers = users.filter((u) => u.enabled);

    const usersWithAvatarUrls = await Promise.all(
      enabledUsers.map(async (u) => ({
        ...u,
        avatarUrl: u.avatar ? (await ctx.storage.getUrl(u.avatar)) || '' : '',
      })),
    );

    return usersWithAvatarUrls;
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !user.enabled) return null;

    const avatarUrl = user.avatar
      ? (await ctx.storage.getUrl(user.avatar)) || ''
      : '';

    return { ...user, avatarUrl };
  },
});

export const getById = query({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args): Promise<CustomResponse<Doc<'users'>>> => {
    if (!args.userId) {
      return failure('userId is required', ErrorCodes.BAD_REQUEST);
    }

    return withAdminCheck(ctx, async () => {
      const user = await ctx.db.get(args.userId!);
      if (!user) return failure('User not found', ErrorCodes.NOT_FOUND);
      if (!user.enabled) return failure('User is disabled', ErrorCodes.FORBIDDEN);
      return success(user);
    });
  },
});

export const syncUserToTable = async (
  ctx: { db: any },
  betterAuthUser: {
    email: string;
    name?: string;
    role?: string;
    enabled?: boolean;
    id: string;
    organizationId?: string;
  },
) => {
  const existingUser = await ctx.db
    .query('users')
    .withIndex('by_email', (q: any) => q.eq('email', betterAuthUser.email))
    .unique();

  if (existingUser) return existingUser._id;

  return ctx.db.insert('users', {
    email: betterAuthUser.email,
    name: betterAuthUser.name || betterAuthUser.email.split('@')[0],
    role: betterAuthUser.role || 'CLIENT',
    enabled: betterAuthUser.enabled ?? true,
    userId: betterAuthUser.id,
    organizationId: (betterAuthUser.organizationId as Id<'organizations'>) || undefined,
  });
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
  handler: async (ctx, args): Promise<CustomResponse<Doc<'users'>>> => {
    return withAdminCheck(ctx, async () => {
      const user = await ctx.db
        .query('users')
        .withIndex('by_userId', (q) => q.eq('userId', args.authUserId))
        .unique();

      if (!user) return failure('User not found', ErrorCodes.NOT_FOUND);
      if (!user.enabled) return failure('User is disabled', ErrorCodes.FORBIDDEN);
      return success(user);
    });
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
    organizationId: v.optional(v.id('organizations')),
  },
  handler: async (ctx, args): Promise<CustomResponse<{ userId: Id<'users'> }>> => {
    return withAdminCheck(ctx, async (currentUser) => {
      const session = await createAuth(ctx).api.signUpEmail({
        body: { email: args.email, password: args.password, name: args.name },
      });

      if (!session?.user?.id) {
        return failure('Failed to create user in Better Auth', ErrorCodes.INTERNAL_SERVER_ERROR);
      }

      const orgId = currentUser.role === 'SUPER_ADMIN'
        ? (args.organizationId ?? getOrganizationId(currentUser))
        : getOrganizationId(currentUser);

      const userId = await ctx.db.insert('users', {
        email: args.email,
        name: args.name,
        role: args.role,
        avatar: args.avatar,
        ocr: args.ocr,
        enabled: true,
        userId: session.user.id,
        organizationId: orgId ?? undefined,
      });

      return success({ userId });
    });
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
    organizationId: v.optional(v.id('organizations')),
    avatar: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAdmin(ctx);
    const targetUser = await ctx.db.get(args.userId);

    if (targetUser && !verifyOrgOwnership(currentUser, targetUser.organizationId)) {
      throw new Error('Not authorized to update this user');
    }

    const { userId, ...updates } = args;

    if (currentUser.role !== 'SUPER_ADMIN') {
      delete updates.organizationId;
    }

    await ctx.db.patch(userId, updates);
  },
});

export const deleteUser = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args): Promise<CustomResponse<{ userId: Id<'users'> }>> => {
    return withAdminCheck(ctx, async (currentUser) => {
      const user = await ctx.db.get(args.userId);
      if (!user) return failure('User not found', ErrorCodes.NOT_FOUND);
      if (!verifyOrgOwnership(currentUser, user.organizationId)) return failure('Not authorized', ErrorCodes.FORBIDDEN);
      if (!user.enabled) return failure('User already disabled', ErrorCodes.CONFLICT);

      await ctx.db.patch(args.userId, { enabled: false });
      return success({ userId: args.userId });
    });
  },
});

export const resetUserPassword = mutation({
  args: {
    userId: v.id('users'),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<CustomResponse<{ success: boolean }>> => {
    const currentUser = await requireAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) return failure('User not found', ErrorCodes.NOT_FOUND);
    if (!verifyOrgOwnership(currentUser, user.organizationId)) return failure('Not authorized', ErrorCodes.FORBIDDEN);
    if (!user.userId) return failure('User does not have an associated auth userId', ErrorCodes.BAD_REQUEST);

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
