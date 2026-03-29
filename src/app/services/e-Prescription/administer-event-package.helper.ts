import { Observable, Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { EPrescriptionService } from './e-prescription.service';

export const LAST_PACKAGE_INSUFFICIENT_MESSAGE =
  'Last package dont have enough amount for administration';

function normalizePackageErrorText(message: string): string {
  return message
    .toLowerCase()
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isLastPackageInsufficientError(message: string): boolean {
  if (!message?.trim()) {
    return false;
  }
  let n = normalizePackageErrorText(message);
  n = n.replace(/\bdo not\b/g, 'dont');
  const needle = normalizePackageErrorText(LAST_PACKAGE_INSUFFICIENT_MESSAGE);
  return n.includes(needle);
}

/**
 * SAP PRN prompts that require Yes → retry with PRNResponse "1" (not UserResponse).
 * Examples: planned dose already administered; max administrations per day exceeded.
 */
export function isPrnConfirmationRetryError(message: string): boolean {
  if (!message?.trim()) {
    return false;
  }
  const n = normalizePackageErrorText(message);
  const plannedDoseAlreadyGiven =
    n.includes('planned dose') && n.includes('already been administered');
  const administrationsPerDayExceeded =
    n.includes('administrations per day') && n.includes('exceeded');
  return plannedDoseAlreadyGiven || administrationsPerDayExceeded;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** SAP message first, then two line breaks, then the confirmation question (PRN dialog body). */
function prnShouldCreateEventDialogHtml(sapMessage: string): string {
  return `<p class="text-start" style="margin:0;">${escapeHtml(sapMessage)}</p><br><p style="margin:0;">Should Event be Created?</p>`;
}

function extractODataErrorMessage(error: any): string {
  try {
    const v =
      error?.error?.error?.message?.value ??
      error?.error?.message?.value ??
      error?.message;
    if (typeof v === 'string' && v.length) {
      return v;
    }
  } catch {
    /* ignore */
  }
  return 'An error occurred.';
}

export interface AdministerEventPackageCallbacks {
  onSuccess: (response?: unknown) => void;
  onError: (message: string) => void;
  /** User chose No (or dismissed) on PRN confirmation — close modal without a second error popup */
  onPrnRetryDeclined?: () => void;
}

const MAX_PACKAGE_RETRIES = 4;

/**
 * Subscribes to getAdministerEvent with handling for:
 * - PRN confirmation errors → Yes retries with PRNResponse "1"; No calls onPrnRetryDeclined
 * - Last package insufficient → New/Same package via UserResponse Y/N
 */
export function subscribeAdministerEventWithPackageResponse(
  ePrescriptionService: EPrescriptionService,
  data: Record<string, unknown>,
  callbacks: AdministerEventPackageCallbacks,
  attempt = 0,
  prnRetryUsed = false
): Subscription {
  return ePrescriptionService.postData('e-prescription/getAdministerEvent', data).subscribe({
    next: (resp: unknown) => {
      callbacks.onSuccess(resp);
    },
    error: (error: unknown) => {
      const message = extractODataErrorMessage(error);

      if (isPrnConfirmationRetryError(message) && !prnRetryUsed) {
        swal
          .fire({
            title: false as any,
            html: prnShouldCreateEventDialogHtml(message),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            customClass: { popup: 'myalertpopup' },
            allowOutsideClick: false,
          } as any)
          .then((result) => {
            if (result.isConfirmed) {
              const nextPayload = {
                ...data,
                PRNResponse: '1',
              } as Record<string, unknown>;
              subscribeAdministerEventWithPackageResponse(
                ePrescriptionService,
                nextPayload,
                callbacks,
                attempt,
                true
              );
            } else {
              callbacks.onPrnRetryDeclined?.();
            }
          });
        return;
      }

      if (isLastPackageInsufficientError(message) && attempt < MAX_PACKAGE_RETRIES) {
        swal
          .fire({
            title: 'Package quantity',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'New package',
            cancelButtonText: 'Same package',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            customClass: { popup: 'myalertpopup' },
            allowOutsideClick: false,
          } as any)
          .then((result) => {
            const userResponse = result.isConfirmed ? 'Y' : 'N';
            const nextPayload = {
              ...data,
              UserResponse: userResponse,
            } as Record<string, unknown>;
            subscribeAdministerEventWithPackageResponse(
              ePrescriptionService,
              nextPayload,
              callbacks,
              attempt + 1,
              prnRetryUsed
            );
          });
        return;
      }
      callbacks.onError(message);
    },
  });
}

export function subscribeAdministerEventWithPackageResponseFromObservable(
  call: (params: Record<string, unknown>) => Observable<unknown>,
  params: Record<string, unknown>,
  callbacks: AdministerEventPackageCallbacks,
  attempt = 0,
  prnRetryUsed = false
): Subscription {
  return call(params).subscribe({
    next: (res: unknown) => {
      callbacks.onSuccess(res);
    },
    error: (error: unknown) => {
      const message = extractODataErrorMessage(error);

      if (isPrnConfirmationRetryError(message) && !prnRetryUsed) {
        swal
          .fire({
            title: false as any,
            html: prnShouldCreateEventDialogHtml(message),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            customClass: { popup: 'myalertpopup' },
            allowOutsideClick: false,
          } as any)
          .then((result) => {
            if (result.isConfirmed) {
              const nextPayload = {
                ...params,
                PRNResponse: '1',
              } as Record<string, unknown>;
              subscribeAdministerEventWithPackageResponseFromObservable(
                call,
                nextPayload,
                callbacks,
                attempt,
                true
              );
            } else {
              callbacks.onPrnRetryDeclined?.();
            }
          });
        return;
      }

      if (isLastPackageInsufficientError(message) && attempt < MAX_PACKAGE_RETRIES) {
        swal
          .fire({
            title: 'Package quantity',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'New package',
            cancelButtonText: 'Same package',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            customClass: { popup: 'myalertpopup' },
            allowOutsideClick: false,
          } as any)
          .then((result) => {
            const userResponse = result.isConfirmed ? 'Y' : 'N';
            const nextPayload = {
              ...params,
              UserResponse: userResponse,
            } as Record<string, unknown>;
            subscribeAdministerEventWithPackageResponseFromObservable(
              call,
              nextPayload,
              callbacks,
              attempt + 1,
              prnRetryUsed
            );
          });
        return;
      }
      callbacks.onError(message);
    },
  });
}
