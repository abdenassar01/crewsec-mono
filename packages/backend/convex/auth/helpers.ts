import { type Id } from '../_generated/dataModel';
import { type MutationCtx, type QueryCtx } from '../_generated/server';
import { authComponent } from '../auth';
import { type CustomResponse, ErrorCodes, failure } from '../util';

export const getAuthenticatedUser = async (ctx: QueryCtx | MutationCtx) => {
  try {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser?._id) {
      return null;
    }

    return await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', authUser._id))
      .unique();
  } catch {
    return null;
  }
};

export class AdminAuthError extends Error {
  public readonly code = ErrorCodes.FORBIDDEN;
  constructor() {
    super('Admin role required');
    this.name = 'AdminAuthError';
  }
}

export class SuperAdminAuthError extends Error {
  public readonly code = ErrorCodes.FORBIDDEN;
  constructor() {
    super('Super admin role required');
    this.name = 'SuperAdminAuthError';
  }
}

export class AuthError extends Error {
  public readonly code = ErrorCodes.UNAUTHORIZED;
  constructor() {
    super('Authentication required');
    this.name = 'AuthError';
  }
}

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);
const MANAGER_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'EMPLOYEE']);

export const requireAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const user = await getAuthenticatedUser(ctx);
  if (!user || !ADMIN_ROLES.has(user.role)) {
    throw new AdminAuthError();
  }
  return user;
};

export const requireAdminOrEmployee = async (ctx: QueryCtx | MutationCtx) => {
  const user = await getAuthenticatedUser(ctx);
  if (!user || !MANAGER_ROLES.has(user.role)) {
    throw new AuthError();
  }
  return user;
};

export const requireSuperAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const user = await getAuthenticatedUser(ctx);
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new SuperAdminAuthError();
  }
  return user;
};

export const getOrganizationId = (
  user: { role: string; organizationId?: Id<'organizations'> | null } | null,
): Id<'organizations'> | null => {
  if (!user || user.role === 'SUPER_ADMIN') return null;
  return (user.organizationId as Id<'organizations'>) ?? null;
};

export const verifyOrgOwnership = (
  user: { role: string; organizationId?: Id<'organizations'> | null } | null,
  recordOrgId: Id<'organizations'> | undefined | null,
): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (!recordOrgId) return user.organizationId == null;
  return user.organizationId === recordOrgId;
};

export class OrgOwnershipError extends Error {
  public readonly code = ErrorCodes.FORBIDDEN;
  constructor() {
    super('Not authorized to access this resource');
    this.name = 'OrgOwnershipError';
  }
}

export const requireOrgAccess = (
  user: { role: string; organizationId?: Id<'organizations'> | null } | null,
  recordOrgId: Id<'organizations'> | undefined | null,
) => {
  if (!verifyOrgOwnership(user, recordOrgId)) {
    throw new OrgOwnershipError();
  }
};

export function withAdminCheck<T>(
  ctx: QueryCtx | MutationCtx,
  fn: (user: Awaited<ReturnType<typeof requireAdmin>>) => Promise<CustomResponse<T>>,
): Promise<CustomResponse<T>> {
  return requireAdmin(ctx).then(fn).catch((e) => {
    if (e instanceof AdminAuthError) {
      return failure('Admin role required', ErrorCodes.FORBIDDEN);
    }
    throw e;
  });
}
