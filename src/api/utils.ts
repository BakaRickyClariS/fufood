import { ApiError } from './client';

/**
 * Parses an error from an API call and returns a human-readable message.
 * It handles custom ApiError instances to extract detailed error messages from the response data.
 *
 * @param err The error object, expected to be an instance of ApiError or a standard Error.
 * @param fallback A fallback message to return if no specific error message can be found.
 * @returns A string containing the most specific error message available.
 */
export const parseApiErrorMessage = (
  err: unknown,
  fallback = '操作失敗',
): string => {
  if (err instanceof ApiError) {
    const data = err.data;
    // Support deep parsing of backend error structure
    // e.g., { error: { details: [ { message: "..." } ] } }
    return (
      data?.error?.details?.[0]?.message ||
      data?.message ||
      err.message ||
      fallback
    );
  }
  return (err as Error)?.message || fallback;
};
