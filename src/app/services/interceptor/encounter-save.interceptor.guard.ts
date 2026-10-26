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

function blank(value: unknown): boolean {
  return /^0*$/.test(String(value ?? '').trim());
}

// Collects every value of a case field (any casing, any depth) in a request body.
function fieldValues(body: unknown, field: string, found: unknown[] = []): unknown[] {
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    body.forEach((value, key) => { if (key.toLowerCase() === field) { found.push(value); } });
  } else if (typeof body === 'string' && /^\s*[[{]/.test(body)) {
    try { fieldValues(JSON.parse(body), field, found); } catch { /* not JSON */ }
  } else if (body && typeof body === 'object') {
    for (const [key, value] of Object.entries(body)) {
      if (key.toLowerCase() === field) { found.push(value); } else { fieldValues(value, field, found); }
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
  private incompletePage(): boolean {
    const page = this.router.parseUrl(this.router.url).queryParams;
    return 'falnr' in page && !!page.patnr && (blank(page.falnr) || blank(page.lfdnr));
  }

  private blockedReason(req: HttpRequest<any>): 'case' | 'movement' | null {
    if (!this.incompletePage()) { return null; }
    const endpoint = req.url.split('?')[0].split('/').pop() ?? '';
    if (!WRITE_METHODS.includes(req.method) || !WRITE_ENDPOINT.test(endpoint)) { return null; }
    if (fieldValues(req.body, 'falnr').some(blank)) { return 'case'; }
    if (fieldValues(req.body, 'lfdnr').some(blank)) { return 'movement'; }
    return null;
  }
}
