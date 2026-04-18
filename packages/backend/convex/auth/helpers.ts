import { type MutationCtx, type QueryCtx } from '../_generated/server';
import { authComponent } from '../auth';
import { ErrorCodes, failure } from '../util';

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

/**
 * Error thrown when admin authorization fails. Functions returning CustomResponse
 * can catch this and convert it to a failure response.
 */
export class AdminAuthError extends Error {
  public readonly code: number;

  constructor() {
    super('Admin role required');
    this.name = 'AdminAuthError';
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

/**
 * Require the current user to have admin role.
 * Throws AdminAuthError if the user is not authenticated or is not an admin.
 * Functions returning CustomResponse should catch this and return failure().
 */
export const requireAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const user = await getAuthenticatedUser(ctx);

  if (user?.role !== 'ADMIN') {
    throw new AdminAuthError();
  }

  return user;
};

/**
 * Require the current user to be authenticated and have admin or employee role.
 * Throws AuthError if the user is not authenticated or is not an admin/employee.
 */
export const requireAdminOrEmployee = async (ctx: QueryCtx | MutationCtx) => {
  const user = await getAuthenticatedUser(ctx);

  if (user?.role !== 'ADMIN' && user?.role !== 'EMPLOYEE') {
    throw new AuthError();
  }

  return user;
};
