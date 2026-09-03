/**
 * Pure, dependency-free helpers for SAP's "patients merged" response.
 *
 * When an MRN has been merged into another patient record, SAP/IS-H rejects the
 * patient search with error code `SY/530` and names the surviving ("active")
 * patient number in the message text:
 *
 *   "Patient 0000005803 was canceled (patients merged).
 *    The active patient number is 0000005802."
 *
 * Without this the search only surfaces a generic "no patient found", which
 * makes an existing patient look absent - a real risk of duplicate records in a
 * clinical system. These helpers are intentionally free of Angular /
 * SweetAlert / network dependencies so they can be unit tested in isolation and
 * reused from the other patient-search entry points. They never mutate their
 * inputs.
 */

/** The SAP error code that identifies a merged (canceled) patient. */
export const MERGED_PATIENT_ERROR_CODE = 'SY/530';

/** A merged-patient redirect resolved from a failed patient search. */
export interface MergedPatientInfo {
  /** The searched MRN that SAP canceled, e.g. "0000005803". */
  canceledMrn: string;
  /** The surviving MRN the user should open instead, e.g. "0000005802". */
  activeMrn: string;
  /** The raw SAP message, shown verbatim in the warning popup. */
  message: string;
}

/** Matches the canceled patient number at the head of the SAP message. */
const CANCELED_MRN_PATTERN = /patient\s+(\d+)\s+was\s+canceled/i;

/** Matches the surviving patient number at the tail of the SAP message. */
const ACTIVE_MRN_PATTERN = /active\s+patient\s+number\s+is\s+(\d+)/i;

/**
 * Locates the OData error node regardless of how far the caller has already
 * unwrapped the failure. Checked in order so the Angular `HttpErrorResponse`
 * form (`err.error.error`) wins over the raw response body (`body.error`).
 */
function resolveErrorNode(error: any): any {
  const candidates = [error?.error?.error, error?.error, error];
  return candidates.find((node) => node && typeof node.code === 'string');
}

/**
 * Collects the message texts worth parsing, most specific first. SAP repeats the
 * text in `errordetails`, so the fallback covers responses that omit the
 * top-level `message.value`.
 */
function collectMessages(node: any): string[] {
  const details = node?.innererror?.errordetails;
  const candidates = [
    node?.message?.value,
    typeof node?.message === 'string' ? node.message : undefined,
    Array.isArray(details) ? details[0]?.message : undefined,
  ];
  return candidates.filter(
    (text): text is string => typeof text === 'string' && text.trim() !== ''
  );
}

/**
 * Reads the merged-patient redirect out of a failed patient search.
 *
 * Returns `null` for anything that is not an unambiguous merge, including a
 * `SY/530` whose text cannot be parsed. Showing the wrong MRN is worse than
 * showing the ordinary error, so the caller falls back rather than guessing.
 *
 * MRNs are kept as strings: they are zero-padded and numeric conversion would
 * destroy the padding the follow-up search needs.
 */
export function parseMergedPatientError(error: any): MergedPatientInfo | null {
  const node = resolveErrorNode(error);
  if (!node || node.code !== MERGED_PATIENT_ERROR_CODE) {
    return null;
  }

  for (const message of collectMessages(node)) {
    const canceledMrn = message.match(CANCELED_MRN_PATTERN)?.[1];
    const activeMrn = message.match(ACTIVE_MRN_PATTERN)?.[1];

    // An "active" number identical to the canceled one would send the user
    // straight back into the same warning, so treat it as unparseable.
    if (canceledMrn && activeMrn && canceledMrn !== activeMrn) {
      return { canceledMrn, activeMrn, message };
    }
  }

  return null;
}

/**
 * Strips SAP's zero padding for display only: "0000005802" reads as "5802".
 *
 * The padded value stays the source of truth for anything sent back to SAP (see
 * `normalizeId` in the header, which pads to 10 before a call), so never feed a
 * formatted MRN into a request. The lookahead guarantees at least one digit
 * survives, so an all-zero value degrades to "0" rather than an empty label.
 */
export function formatMrnForDisplay(mrn: string): string {
  return typeof mrn === 'string' ? mrn.trim().replace(/^0+(?=\d)/, '') : '';
}

/**
 * The SAP message with both MRNs unpadded, for display in the warning popup.
 *
 * Only the two MRNs already parsed out of the message are substituted, so the
 * clinical wording is preserved verbatim and no other number in the sentence can
 * be altered by accident.
 *
 * Runs of whitespace are collapsed because SAP pads the patient number to a
 * fixed field width, and the two services pad differently: ZNEEMR_SRV (global
 * search) pads with zeros, ZN_EMERGENCY_DASHBOARD_SRV (ER history) pads with
 * spaces, which would otherwise show as gaps mid-sentence.
 */
export function formatMergedPatientMessage(info: MergedPatientInfo): string {
  return info.message
    .split(info.canceledMrn)
    .join(formatMrnForDisplay(info.canceledMrn))
    .split(info.activeMrn)
    .join(formatMrnForDisplay(info.activeMrn))
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim();
}
