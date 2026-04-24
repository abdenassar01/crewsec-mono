import { type Id } from '../_generated/dataModel';
import { type MutationCtx, type QueryCtx } from '../_generated/server';
import { authComponent } from '../auth';
import { ErrorCodes } from '../util';

export const getAuthenticatedUser = async (ctx: QueryCtx | MutationCtx) => {
  try {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser?._id) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', authUser._id))
      .unique();

    return user;
  } catch (error) {
    console.log('[Debug | auth:getAuthenticatedUser()]: ', error);
    return null;
  }
};

export class AdminAuthError extends Error {
  public readonly code: number;

  constructor() {
    super('Admin role required');
    this.name = 'AdminAuthError';
    this.code = ErrorCodes.FORBIDDEN;
  }
}

export class SuperAdminAuthError extends Error {
  public readonly code: number;

  constructor() {
    super('Super admin role required');
    this.name = 'SuperAdminAuthError';
    this.code = ErrorCodes.FORBIDDEN;
  }
}

export class AuthError extends Error {
  public readonly code: number;

  constructor() {
    super('Authentication required');
    this.name = 'AuthError';
    this.code = ErrorCodes.UNAUTHORIZED;
  }
}

export const requireAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const user = await getAuthenticatedUser(ctx);

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    throw new AdminAuthError();
  }

  return user;
};

export const requireAdminOrEmployee = async (ctx: QueryCtx | MutationCtx) => {
  const user = await getAuthenticatedUser(ctx);

  if (
    user?.role !== 'ADMIN' &&
    user?.role !== 'SUPER_ADMIN' &&
    user?.role !== 'EMPLOYEE'
  ) {
    throw new AuthError();
  }

  return user;
};

export const requireSuperAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const user = await getAuthenticatedUser(ctx);

  if (user?.role !== 'SUPER_ADMIN') {
    throw new SuperAdminAuthError();
  }

  return user;
};

export const getOrganizationId = (
  user: { role: string; organizationId?: Id<'organizations'> | null } | null,
): Id<'organizations'> | null => {
  if (!user) return null;
  if (user.role === 'SUPER_ADMIN') return null;
  return (user.organizationId as Id<'organizations'>) ?? null;
};

export const verifyOrgOwnership = (
  user: { role: string; organizationId?: Id<'organizations'> | null } | null,
  recordOrgId: Id<'organizations'> | undefined | null,
): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (!recordOrgId) return true;
  return user.organizationId === recordOrgId;
};
