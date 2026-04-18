'use client'

import {
  useMutation as useConvexMutation,
  usePaginatedQuery as useConvexPaginatedQuery,
  useQuery as useConvexQuery,
} from 'convex/react';
import type { FunctionReference, OptionalRestArgs } from 'convex/server';
import { useCallback, useEffect, useRef } from 'react';

import { showErrorMessage } from '@/components/ui/utils';

/**
 * Standard error response structure from the backend.
 */
type ErrorResponse = {
  error: {
    code: number;
    message: string;
  };
  data: never;
};

/**
 * Type guard to check if a result is a CustomResponse with an error.
 */
function isErrorResponse(result: unknown): result is ErrorResponse {
  return (
    result !== null &&
    typeof result === 'object' &&
    'error' in result &&
    result.error !== null &&
    typeof result.error === 'object' &&
    'code' in result.error &&
    'message' in result.error
  );
}

/**
 * SAFE MUTATION
 *
 * Automatically catches backend errors returned as data AND physical exceptions.
 * Instead of throwing (which causes React crashes), it returns null on error
 * and shows a toast notification.
 *
 * @returns A function that returns the data on success, or null on failure.
 */
export function useSafeMutation<T extends FunctionReference<'mutation'>>(
  mutationReference: T,
) {
  const mutation = useConvexMutation(mutationReference);

  return useCallback(
    async (...args: OptionalRestArgs<T>): Promise<any> => {
      try {
        const result = await mutation(...args);

        // Check if backend returned our custom error object
        if (isErrorResponse(result)) {
          showErrorMessage(`${result.error.code}: ${result.error.message}`);
          return null; // Return null instead of crashing
        }

        // Return data if using result pattern, else whole result
        return result?.data ?? result;
      } catch (err: unknown) {
        // This catches network errors or unexpected backend crashes
        const message =
          err instanceof Error ? err.message : 'Network error occurred';
        showErrorMessage(message);
        return null;
      }
    },
    [mutation],
  );
}

/**
 * Extract the inner data type from CustomResponse<T>
 * If T is CustomResponse<U>, returns U, otherwise returns T
 */
type ExtractDataType<T> = T extends { data: infer U; error: any }
  ? U
  : T extends { data: infer U }
    ? U
    : T;

/**
 * Extract data from CustomResponse or return the value itself
 */
function extractData<T>(result: T): T {
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T }).data;
  }
  return result;
}

/**
 * Handle error display for a result
 */
function useErrorHandler(result: unknown, lastErrorRef: React.MutableRefObject<string | null>) {
  useEffect(() => {
    // If the query returns our error structure
    if (isErrorResponse(result)) {
      const errorKey = `${result.error.code}-${result.error.message}`;

      // Prevent infinite toast loops if the query re-runs
      if (lastErrorRef.current !== errorKey) {
        showErrorMessage(result.error.message);
        lastErrorRef.current = errorKey;
      }
    } else {
      lastErrorRef.current = null;
    }
  }, [result, lastErrorRef]);
}

/**
 * SAFE QUERY
 *
 * Monitors the reactive result. If an error object arrives, it shows a toast.
 * Returns the data portion if using the Result Pattern, otherwise returns
 * the whole result.
 *
 * Usage:
 * - `undefined` = Still loading
 * - `null` = Error occurred (toast already shown)
 * - `T` = Success with data
 */
export function useSafeQuery<T extends FunctionReference<'query'>>(
  queryReference: T,
  ...args: OptionalRestArgs<T>
): ExtractDataType<T['_returnType']> | null | undefined {
  const result = useConvexQuery(queryReference, ...args);
  const lastErrorRef = useRef<string | null>(null);

  useErrorHandler(result, lastErrorRef);

  // If using the result pattern, return the data property, otherwise return whole result
  return extractData(result) as ExtractDataType<T['_returnType']> | null | undefined;
}

/**
 * SAFE PAGINATED QUERY
 *
 * Similar to useSafeQuery but for paginated queries.
 * Handles error objects in paginated results.
 *
 * Usage:
 * - Returns the same object as usePaginatedQuery but with data extracted
 * from CustomResponse wrappers
 */
export function useSafePaginatedQuery<T extends FunctionReference<'query'>>(
  queryReference: T,
  ...args: any[]
) {
  // usePaginatedQuery takes 3 args: func, args, options
  // Detect if the last argument is the options object (has initialNumItems)
  const lastArg = args[args.length - 1];
  const hasOptions = args.length > 1 && lastArg && typeof lastArg === 'object' && 'initialNumItems' in lastArg;

  // queryArgs needs to be the first arg object (not an array)
  // because useConvexPaginatedQuery expects: (func, argsObject, options)
  const queryArgs = hasOptions ? args[0] : args[0];
  const options = hasOptions ? lastArg : {};

  const result = useConvexPaginatedQuery(
    queryReference,
    queryArgs,
    options
  );
  const lastErrorRef = useRef<string | null>(null);

  // Check for errors in results
  useErrorHandler(result.results, lastErrorRef);

  // Extract data from results if they're wrapped in CustomResponse
  const extractedResults = extractData(result.results);

  return {
    ...result,
    results: extractedResults as any,
  };
}
