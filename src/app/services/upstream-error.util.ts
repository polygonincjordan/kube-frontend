/**
 * Pure, dependency-free reader for the message inside a failed HTTP call.
 *
 * A failure reaches the app in more than one shape, because more than one layer
 * can produce it:
 *
 *   - SAP answered with an OData error, which the backend passes through
 *     verbatim:            `{ error: { message: { value: '...' } } }`
 *   - SAP was never reached, and the backend reported the transport failure:
 *     `{ message: 'Upstream service unavailable', code: 'UPSTREAM_UNAVAILABLE' }`
 *   - The request never produced a response body at all, so only Angular's own
 *     `HttpErrorResponse.message` exists.
 *
 * Today each call site digs for one of these by hand, which is why an
 * unexpected shape throws inside the very `error` callback that was meant to
 * report it. This helper reads all three in one place and always returns a
 * string, so a popup can be shown without a second failure.
 *
 * It is intentionally free of Angular, HttpClient, and SweetAlert dependencies
 * so it can be unit tested in isolation and called from any component or
 * service. It never mutates its input.
 */

/** Shown when no layer supplied a usable message. */
export const DEFAULT_ERROR_MESSAGE = 'Unexpected error';

/**
 * Only a non-empty string is a message a user can read. Every lookup below can
 * legitimately land on `undefined`, on an object (SAP nests `message` as
 * `{ lang, value }`), or on whitespace, and returning any of those would push
 * "[object Object]" or a blank popup in front of a clinician.
 */
function usableMessage(candidate: any): string | null {
  return typeof candidate === 'string' && candidate.trim() !== ''
    ? candidate
    : null;
}

/**
 * Reads the most specific message available on a failed request.
 *
 * Order matters: the SAP text is the one that names the actual clinical or
 * validation problem, so it wins over the backend's generic transport message,
 * which in turn wins over Angular's "Http failure response for ..." string.
 *
 * `error.error` is the response body as Angular parsed it, so `error.error.error`
 * is SAP's own `error` node inside that body - the double nesting is real, not a
 * typo.
 */
export function getErrorMessage(error: any): string {
  const candidates = [
    error?.error?.error?.message?.value, // SAP OData error body
    error?.error?.message,               // backend failure body, or a plain { message }
    error?.message,                      // HttpErrorResponse / transport message
  ];

  for (const candidate of candidates) {
    const message = usableMessage(candidate);
    if (message) {
      return message;
    }
  }

  return DEFAULT_ERROR_MESSAGE;
}
