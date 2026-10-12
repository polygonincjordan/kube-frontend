import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
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
    // The route's existing role guard runs first. Never request encounter data
    // after it has rejected the session and cleared authentication.
    if (!this.storage.isLoggedIn()) { return false; }
    const params = route.queryParams;
    const hasEncounter = ['patnr', 'einri', 'falnr', 'lfdnr'].some(key => key in params);
    if (!hasEncounter && params.nav !== 'Treatmentarea') { return true; }

    const normalized: { [key: string]: string } = {};
    for (const [key, length] of [['patnr', 10], ['einri', 4], ['falnr', 10]] as [string, number][]) {
      const value = params[key];
      if (typeof value !== 'string' || !/^\d+$/.test(value) || value.length > length || Number(value) === 0) {
        return this.reject();
      }
      normalized[key] = value.padStart(length, '0');
    }

    const movement = params.lfdnr;
    if (typeof movement === 'string' && /^\d{1,5}$/.test(movement) && Number(movement) > 0) {
      normalized.lfdnr = movement.padStart(5, '0');
      if (Object.keys(normalized).every(key => normalized[key] === params[key])) { return true; }
      return this.correctUrl(state.url, normalized);
    }

    return this.encounters.resolve(normalized.patnr, normalized.einri, normalized.falnr).pipe(
      map(encounter => this.correctUrl(state.url, {
        patnr: encounter.Patnr, einri: encounter.Einri,
        falnr: encounter.Falnr, lfdnr: encounter.Lfdnr
      })),
      catchError(() => of(this.reject()))
    );
  }

  private correctUrl(url: string, params: { [key: string]: string }): UrlTree {
    const tree = this.router.parseUrl(url);
    tree.queryParams = { ...tree.queryParams, ...params };
    return tree;
  }

  private reject(): false {
    Swal.fire({
      icon: 'error', title: 'Unable to open patient',
      text: 'The patient encounter could not be identified. Please reopen the case from patient search.'
    });
    return false;
  }
}
