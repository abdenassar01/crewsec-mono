import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { authComponent, createAuth } from './auth';
import { requireSuperAdmin } from './auth/helpers';

export const seedAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.optional(
      v.union(
        v.literal('ADMIN'),
        v.literal('SUPER_ADMIN'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const session = await createAuth(ctx).api.signUpEmail({
      body: {
        email: args.email,
        password: args.password,
        name: args.name,
      },
    });

    if (!session?.user?.id) {
      throw new Error('Failed to create user in Better Auth');
    }

    const userId = await ctx.db.insert('users', {
      email: args.email,
      name: args.name,
      role: args.role ?? 'ADMIN',
      enabled: true,
      userId: session.user.id,
    });

    return userId;
  },
});

export const seedOrganizationWithAdmin = mutation({
  args: {
    orgName: v.string(),
    orgDescription: v.optional(v.string()),
    orgEmail: v.optional(v.string()),
    adminEmail: v.string(),
    adminPassword: v.string(),
    adminName: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await ctx.db.insert('organizations', {
      name: args.orgName,
      description: args.orgDescription,
      email: args.orgEmail,
      subscriptionStatus: 'TRIAL',
      createdAt: Date.now(),
    });

    const session = await createAuth(ctx).api.signUpEmail({
      body: {
        email: args.adminEmail,
        password: args.adminPassword,
        name: args.adminName,
      },
    });

    if (!session?.user?.id) {
      throw new Error('Failed to create admin user in Better Auth');
    }

    const userId = await ctx.db.insert('users', {
      email: args.adminEmail,
      name: args.adminName,
      role: 'ADMIN',
      enabled: true,
      userId: session.user.id,
      organizationId: orgId,
    });

    return { orgId, userId };
  },
});
