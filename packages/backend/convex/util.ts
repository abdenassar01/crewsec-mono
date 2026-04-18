/**
 * Result Pattern for graceful error handling in Convex functions.
 *
 * Instead of throwing errors that cause React crashes, return a standardized
 * response object that can be safely handled on the frontend.
 */

export type CustomResponse<T> = {
  data: T | null;
  error: {
    code: number;
    message: string;
  } | null;
};

/**
 * Create a successful response with data.
 */
export const success = <T>(data: T): CustomResponse<T> => ({
  data,
  error: null,
});

/**
 * Create a failure response with an error message and status code.
 */
export const failure = (
  message: string,
  code: number = 500,
): CustomResponse<never> => ({
  data: null,
  error: { code, message },
});

/**
 * Common error codes for consistent error handling.
 */
export const ErrorCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
