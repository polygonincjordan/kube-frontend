import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import Swal from 'sweetalert2';

const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const WRITE_ENDPOINT = /^(save|create|update|delete|replace|release)/i;

const REASONS = {
  case: 'Saving isn\'t available: this visit has no case in SAP yet, and documents must be saved to a case.',
  movement: 'Saving isn\'t available: this case has no movement in SAP, and documents must be filed to a ' +
    'movement. Please contact support if this is unexpected.'
};

// Payloads name the case and the movement in several ways. MovementId is left
// out: progress notes always send '00000' there, even with a movement.
const FIELDS = {
  case: ['falnr', 'caseid', 'caseno', 'casenumber', 'case'],
  movement: ['lfdnr', 'lfdbw', 'movemntseqno']
};

function blank(value: unknown): boolean {
  return /^0*$/.test(String(value ?? '').trim());
}

// Collects every primitive value of the named fields (any casing, any depth).
function fieldValues(body: unknown, names: string[], found: unknown[] = []): unknown[] {
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    body.forEach((value, key) => { if (names.includes(key.toLowerCase())) { found.push(value); } });
  } else if (typeof body === 'string' && /^\s*[[{]/.test(body)) {
    try { fieldValues(JSON.parse(body), names, found); } catch { /* not JSON */ }
  } else if (body && typeof body === 'object') {
    for (const [key, value] of Object.entries(body)) {
      if (names.includes(key.toLowerCase()) && (value === null || typeof value !== 'object')) {
        found.push(value);
      } else {
        fieldValues(value, names, found);
      }
    }
  }
  return found;
}

// A Planned visit has no case, and a case can lack a movement. Viewing stays
// open; only a case-document save from such a page is stopped, with the reason.
@Injectable({ providedIn: 'root' })
export class EncounterSaveInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const reason = this.blockedReason(req);
    if (!reason) { return next.handle(req); }
    Swal.fire({ icon: 'warning', title: 'Saving isn\'t available', text: REASONS[reason] });
    // EMPTY rather than an error, so a caller's own error popup can't replace the reason.
    return EMPTY;
  }

  // Judged from the current page URL only. StorageService keeps the last
  // patient after leaving their page, and some modules (e-prescription) keep
  // their own empty copy. A page counts only when its URL carries a case.
  private missingOnPage(): 'case' | 'movement' | null {
    const page = this.router.parseUrl(this.router.url).queryParams;
    if (!('falnr' in page) || !page.patnr) { return null; }
    if (blank(page.falnr)) { return 'case'; }
    return blank(page.lfdnr) ? 'movement' : null;
  }

  private blockedReason(req: HttpRequest<any>): 'case' | 'movement' | null {
    const missing = this.missingOnPage();
    if (!missing) { return null; }
    const endpoint = req.url.split('?')[0].split('/').pop() ?? '';
    if (!WRITE_METHODS.includes(req.method) || !WRITE_ENDPOINT.test(endpoint)) { return null; }
    return fieldValues(req.body, FIELDS[missing]).some(blank) ? missing : null;
  }
}
