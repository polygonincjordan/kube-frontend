import {
  DEFAULT_ERROR_MESSAGE,
  getErrorMessage,
} from './upstream-error.util';

/**
 * The payloads below are the shapes this app actually receives, captured from
 * the backend proxy and from SAP/OData rather than invented for the test.
 */

/** SAP answered with an OData error; the backend passes the body through. */
function sapODataError(value: string): any {
  return {
    status: 400,
    message: 'Http failure response for http://localhost:6052/e-order: 400 Bad Request',
    error: {
      error: {
        code: 'ZN_AVAP/023',
        message: { lang: 'en', value },
        innererror: {
          errordetails: [{ code: 'ZN_AVAP/023', message: value }],
        },
      },
    },
  };
}

/** SAP was never reached; the backend reported the transport failure itself. */
function upstreamUnavailableError(): any {
  return {
    status: 502,
    message: 'Http failure response for http://localhost:6052/patient: 502 Bad Gateway',
    error: { message: 'Upstream service unavailable', code: 'UPSTREAM_UNAVAILABLE' },
  };
}

describe('getErrorMessage', () => {
  it('prefers the SAP message over the generic transport text', () => {
    const value = 'Bundle cannot be released before all items are answered.';

    expect(getErrorMessage(sapODataError(value))).toBe(value);
  });

  it("reads the backend's message when SAP was never reached", () => {
    expect(getErrorMessage(upstreamUnavailableError())).toBe(
      'Upstream service unavailable'
    );
  });

  it('falls back to the Angular error message when there is no body', () => {
    const error = {
      status: 0,
      message: 'Http failure response for http://localhost:6052/vital: 0 Unknown Error',
      error: null,
    };

    expect(getErrorMessage(error)).toBe(error.message);
  });

  it('falls back to the default when no layer supplied a message', () => {
    expect(getErrorMessage({ status: 500, error: {} })).toBe(DEFAULT_ERROR_MESSAGE);
  });

  // The whole point of the helper: the old hand-written lookups threw here,
  // inside the error handler that was supposed to report the failure.
  it('never throws on a shape it does not recognise', () => {
    const hostile = [
      undefined,
      null,
      '',
      'a plain string body',
      0,
      { error: 'SAP returned an HTML page' },
      { error: { message: { lang: 'en', value: 'nested, not a string' } } },
      { error: { error: null } },
    ];

    for (const error of hostile) {
      expect(() => getErrorMessage(error)).not.toThrow();
      expect(typeof getErrorMessage(error)).toBe('string');
    }
  });

  it('ignores a blank message instead of showing an empty popup', () => {
    expect(getErrorMessage({ error: { message: '   ' } })).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it('does not mutate the error it was given', () => {
    const error = upstreamUnavailableError();
    const before = JSON.stringify(error);

    getErrorMessage(error);

    expect(JSON.stringify(error)).toBe(before);
  });
});
