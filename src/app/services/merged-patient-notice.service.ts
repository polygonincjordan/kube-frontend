import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import {
  formatMergedPatientMessage,
  formatMrnForDisplay,
  parseMergedPatientError,
} from './merged-patient.util';

/**
 * Shows the "patient record merged" redirect for a failed patient search.
 *
 * SAP rejects a search for an MRN that was merged into another record, naming
 * the surviving number. That is a redirect, not a dead end, so it is surfaced as
 * a warning offering the active MRN rather than as "no patient found".
 *
 * The behaviour lives here because the patient search is duplicated across the
 * global header and seven `er-history/patient-search` copies; a single service
 * keeps the wording and the redirect identical in all of them.
 */
@Injectable({ providedIn: 'root' })
export class MergedPatientNoticeService {
  /**
   * Shows the notice when `error` is a merged-patient rejection.
   *
   * Returns `true` when it handled the error, so the caller can skip its own
   * generic error handling; `false` leaves the caller's behaviour untouched.
   *
   * `openActiveMrn` runs only if the user confirms. It receives the MRN exactly
   * as SAP returned it - use that for the follow-up request, since the two SAP
   * services pad it differently - and a display form with the padding stripped,
   * for the search field the user sees.
   */
  handle(
    error: any,
    openActiveMrn: (activeMrn: string, displayMrn: string) => void
  ): boolean {
    const mergedPatient = parseMergedPatientError(error);
    if (!mergedPatient) {
      return false;
    }

    const displayMrn = formatMrnForDisplay(mergedPatient.activeMrn);

    // `text`, not `html`, so SweetAlert escapes the server-supplied message.
    Swal.fire({
      title: 'Patient record merged',
      text: formatMergedPatientMessage(mergedPatient),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Open MRN ${displayMrn}`,
      cancelButtonText: 'Close',
    }).then((result) => {
      if (result.isConfirmed) {
        openActiveMrn(mergedPatient.activeMrn, displayMrn);
      }
    });

    return true;
  }
}
