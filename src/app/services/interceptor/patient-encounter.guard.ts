import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { CaseEncounterService } from '../case-encounter.service';
import { StorageService } from '../storage.service';

@Injectable({ providedIn: 'root' })
export class PatientEncounterGuard implements CanActivate {
  constructor(
    private encounters: CaseEncounterService,
    private router: Router,
    private storage: StorageService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> {
    // Used once: only the run right after this guard's own redirect may skip
    // the lookup. Any other entry clears it.
    const redirected = this.redirectedTo;
    this.redirectedTo = '';
    // The route's existing role guard runs first. Never request encounter data
    // after it has rejected the session and cleared authentication.
    if (!this.storage.isLoggedIn()) { return false; }
    const params = route.queryParams;
    const hasEncounter = ['patnr', 'einri', 'falnr', 'lfdnr'].some(key => key in params);
    if (!hasEncounter && params.nav !== 'Treatmentarea') { return true; }

    // A Planned visit has no SAP case yet. My Clinic opens it with an empty case
    // and a zero movement so history can be reviewed before check-in.
    const movement = params.lfdnr;
    const patientOnly = (params.falnr === undefined || params.falnr === '') &&
      (movement === undefined || (typeof movement === 'string' && /^0*$/.test(movement)));

    const identity: [string, number][] = [['patnr', 10], ['einri', 4]];
    if (!patientOnly) { identity.push(['falnr', 10]); }
    const normalized: { [key: string]: string } = {};
    for (const [key, length] of identity) {
      const value = params[key];
      if (typeof value !== 'string' || !/^\d+$/.test(value) || value.length > length || Number(value) === 0) {
        return this.reject('invalid-identifiers');
      }
      normalized[key] = value.padStart(length, '0');
    }

    if (patientOnly) {
      if (Object.keys(normalized).every(key => normalized[key] === params[key])) { return true; }
      return this.correctUrl(state.url, normalized);
    }

    // Every link with a case is checked against SAP. A valid movement alone does
    // not prove that the case belongs to the patient in the link.
    const requested = typeof movement === 'string' && /^\d{1,5}$/.test(movement) && Number(movement) > 0
      ? movement.padStart(5, '0') : '';
    const unchanged = (target: { [key: string]: string }) =>
      Object.keys(target).every(key => target[key] === params[key]);
    // The redirect lands on exactly the URL this guard just verified.
    if (redirected && redirected === this.keyOf(params)) { return true; }

    return this.encounters.resolve(normalized.patnr, normalized.einri, normalized.falnr, requested).pipe(
      map(encounter => ({
        patnr: encounter.Patnr, einri: encounter.Einri,
        falnr: encounter.Falnr, lfdnr: encounter.Lfdnr
      })),
      // The case belongs to this patient but has no movement yet. Open it; the
      // save interceptor stops case documents with a reason.
      catchError(error => error?.reason === 'no-movement'
        ? of({ ...normalized, lfdnr: '' })
        : throwError(() => error)),
      map(target => {
        if (unchanged(target)) { return true; }
        this.redirectedTo = this.keyOf(target);
        return this.correctUrl(state.url, target);
      }),
      catchError(error => of(this.reject(error?.reason ?? 'case-lookup-failed')))
    );
  }

  private redirectedTo = '';

  private keyOf(params: { [key: string]: any }): string {
    return [params.patnr, params.einri, params.falnr, params.lfdnr].join('|');
  }

  private correctUrl(url: string, params: { [key: string]: string }): UrlTree {
    const tree = this.router.parseUrl(url);
    tree.queryParams = { ...tree.queryParams, ...params };
    return tree;
  }

  private reject(reason: string): false {
    const code = reason in REJECTION_REASONS ? reason : 'case-lookup-failed';
    // Reason code only: never log patient identifiers.
    console.warn(`[PatientEncounterGuard] ${code}`);
    Swal.fire({ icon: 'error', title: 'Unable to open patient', text: REJECTION_REASONS[code] });
    return false;
  }
}

const REJECTION_REASONS: { [reason: string]: string } = {
  'invalid-identifiers':
    'This link is missing or has invalid patient details. Please reopen the patient from patient search.',
  'patient-case-mismatch':
    'The patient and the case in this link don\'t match. To avoid showing another patient\'s record, ' +
    'the screen was not opened. Please reopen the patient from patient search.',
  'case-lookup-failed':
    'The case couldn\'t be loaded from SAP, so it couldn\'t be checked against the patient. Please try again.'
};
