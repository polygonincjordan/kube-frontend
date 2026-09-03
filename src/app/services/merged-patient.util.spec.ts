import {
  MERGED_PATIENT_ERROR_CODE,
  formatMergedPatientMessage,
  formatMrnForDisplay,
  parseMergedPatientError,
} from './merged-patient.util';

/** The real SAP message, captured from a merged patient in QA. */
const MERGE_MESSAGE =
  'Patient 0000005803 was canceled (patients merged). The active patient number is 0000005802.';

/**
 * The captured SAP/OData payload, wrapped the way Angular's HttpErrorResponse
 * delivers it to a failing `subscribe` error callback.
 */
function buildMergeError(): any {
  return {
    error: {
      error: {
        code: MERGED_PATIENT_ERROR_CODE,
        message: { lang: 'en', value: MERGE_MESSAGE },
        innererror: {
          application: {
            component_id: 'IS-H',
            service_namespace: '/SAP/',
            service_id: 'ZNEEMR_SRV',
            service_version: '0001',
          },
          transactionid: '376F0F97067B0130E006A8C2D601B5A6',
          errordetails: [
            {
              code: '',
              message: MERGE_MESSAGE,
              propertyref: '',
              severity: 'error',
              target: '',
            },
          ],
        },
      },
    },
  };
}

describe('merged-patient.util', () => {
  describe('parseMergedPatientError - the real merged-patient response', () => {
    it('returns both MRNs and the raw message', () => {
      expect(parseMergedPatientError(buildMergeError())).toEqual({
        canceledMrn: '0000005803',
        activeMrn: '0000005802',
        message: MERGE_MESSAGE,
      });
    });

    it('keeps the MRNs as zero-padded strings', () => {
      const info = parseMergedPatientError(buildMergeError());

      expect(info.activeMrn).toBe('0000005802');
      expect(typeof info.activeMrn).toBe('string');
    });
  });

  describe('parseMergedPatientError - message fallbacks', () => {
    it('falls back to errordetails when message.value is absent', () => {
      const error = buildMergeError();
      delete error.error.error.message;

      expect(parseMergedPatientError(error).activeMrn).toBe('0000005802');
    });

    it('falls back to errordetails when message.value is unparseable', () => {
      const error = buildMergeError();
      error.error.error.message.value = 'Patient record unavailable.';

      expect(parseMergedPatientError(error).activeMrn).toBe('0000005802');
    });

    it('reads a message delivered as a plain string', () => {
      const error = { error: { error: { code: MERGED_PATIENT_ERROR_CODE, message: MERGE_MESSAGE } } };

      expect(parseMergedPatientError(error).canceledMrn).toBe('0000005803');
    });

    it('accepts the raw response body, without the HttpErrorResponse wrapper', () => {
      const error = buildMergeError().error;

      expect(parseMergedPatientError(error).activeMrn).toBe('0000005802');
    });
  });

  describe('parseMergedPatientError - returns null rather than guessing', () => {
    it('ignores a different SAP error code', () => {
      const error = buildMergeError();
      error.error.error.code = 'SY/002';

      expect(parseMergedPatientError(error)).toBeNull();
    });

    it('ignores a SY/530 whose text carries no MRNs', () => {
      const error = buildMergeError();
      error.error.error.message.value = 'This patient was canceled.';
      error.error.error.innererror.errordetails[0].message = 'This patient was canceled.';

      expect(parseMergedPatientError(error)).toBeNull();
    });

    it('ignores a SY/530 naming only the canceled MRN', () => {
      const partial = 'Patient 0000005803 was canceled (patients merged).';
      const error = buildMergeError();
      error.error.error.message.value = partial;
      error.error.error.innererror.errordetails[0].message = partial;

      expect(parseMergedPatientError(error)).toBeNull();
    });

    it('ignores a merge that points back at the searched MRN', () => {
      const selfMerge =
        'Patient 0000005803 was canceled (patients merged). The active patient number is 0000005803.';
      const error = buildMergeError();
      error.error.error.message.value = selfMerge;
      error.error.error.innererror.errordetails[0].message = selfMerge;

      expect(parseMergedPatientError(error)).toBeNull();
    });

    it('ignores empty and missing input', () => {
      expect(parseMergedPatientError(null)).toBeNull();
      expect(parseMergedPatientError(undefined)).toBeNull();
      expect(parseMergedPatientError({})).toBeNull();
      expect(parseMergedPatientError({ error: {} })).toBeNull();
      expect(parseMergedPatientError({ error: { error: {} } })).toBeNull();
    });

    it('ignores a network-style failure with no OData body', () => {
      expect(
        parseMergedPatientError({ status: 0, statusText: 'Unknown Error', error: null })
      ).toBeNull();
    });
  });

  describe('formatMrnForDisplay', () => {
    it('drops the zero padding', () => {
      expect(formatMrnForDisplay('0000005802')).toBe('5802');
      expect(formatMrnForDisplay('0000000002')).toBe('2');
    });

    it('leaves an unpadded MRN alone', () => {
      expect(formatMrnForDisplay('5802')).toBe('5802');
    });

    it('keeps a digit when every character is a zero', () => {
      expect(formatMrnForDisplay('0000000000')).toBe('0');
    });

    it('trims surrounding whitespace', () => {
      expect(formatMrnForDisplay('  0000005802 ')).toBe('5802');
    });

    it('returns an empty string for non-string input', () => {
      expect(formatMrnForDisplay(null as any)).toBe('');
      expect(formatMrnForDisplay(undefined as any)).toBe('');
    });
  });

  describe('formatMergedPatientMessage', () => {
    it('unpads both MRNs inside the SAP sentence', () => {
      const info = parseMergedPatientError(buildMergeError());

      expect(formatMergedPatientMessage(info)).toBe(
        'Patient 5803 was canceled (patients merged). The active patient number is 5802.'
      );
    });

    it('leaves the surrounding clinical wording untouched', () => {
      const info = parseMergedPatientError(buildMergeError());
      const formatted = formatMergedPatientMessage(info);

      expect(formatted).toContain('was canceled (patients merged).');
      expect(formatted).not.toContain('0000005');
    });

    it('collapses the space padding used by the ER History service', () => {
      // ZN_EMERGENCY_DASHBOARD_SRV pads the patient number with spaces instead
      // of zeros, leaving gaps before "was" and before the final period.
      const spacePadded =
        'Patient 5803       was canceled (patients merged). The active patient number is 5802     .';
      const error = buildMergeError();
      error.error.error.message.value = spacePadded;
      const info = parseMergedPatientError(error);

      expect(info.canceledMrn).toBe('5803');
      expect(info.activeMrn).toBe('5802');
      expect(formatMergedPatientMessage(info)).toBe(
        'Patient 5803 was canceled (patients merged). The active patient number is 5802.'
      );
    });

    it('renders both service formats identically', () => {
      const zeroPadded = parseMergedPatientError(buildMergeError());

      const spaceError = buildMergeError();
      spaceError.error.error.message.value =
        'Patient 5803       was canceled (patients merged). The active patient number is 5802     .';
      const spacePadded = parseMergedPatientError(spaceError);

      expect(formatMergedPatientMessage(spacePadded)).toBe(
        formatMergedPatientMessage(zeroPadded)
      );
    });

    it('does not alter other numbers in the message', () => {
      const withYear =
        'Patient 0000005803 was canceled (patients merged) on 2026. The active patient number is 0000005802.';
      const error = buildMergeError();
      error.error.error.message.value = withYear;
      const info = parseMergedPatientError(error);

      expect(formatMergedPatientMessage(info)).toContain('on 2026.');
    });
  });
});
