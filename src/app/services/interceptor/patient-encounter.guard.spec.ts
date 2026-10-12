import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom, isObservable, of, Subject, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { rootRoutes } from '../../root/root.module';
import { PatientEncounterGuard } from './patient-encounter.guard';

@Component({ template: '<router-outlet></router-outlet>' })
class EntryHost {}

@Component({ template: '' })
class PatientScreen {}

describe('PatientEncounterGuard', () => {
  let guard: PatientEncounterGuard;
  let router: Router;
  let encounters: any;
  let storage: any;
  const complete = { patnr: '0000000156', einri: '1000', falnr: '0000011612', lfdnr: '00001' };
  const resolved = { Patnr: complete.patnr, Einri: complete.einri, Falnr: complete.falnr, Lfdnr: complete.lfdnr };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RouterTestingModule], declarations: [EntryHost, PatientScreen],
      providers: [{ provide: PatientEncounterGuard, useFactory: () => guard }] });
    router = TestBed.inject(Router);
    encounters = { resolve: jasmine.createSpy().and.returnValue(of(resolved)) };
    storage = { isLoggedIn: () => true };
    spyOn(Swal, 'fire').and.stub();
    guard = new PatientEncounterGuard(encounters, router, storage);
  });

  function enter(params: any, url = '/nursing-inpatient-dashboard?nav=Treatmentarea&action=view#orders') {
    return guard.canActivate({ queryParams: params } as ActivatedRouteSnapshot, { url } as RouterStateSnapshot);
  }

  async function result(params: any, url?: string) {
    const value = enter(params, url);
    return isObservable(value) ? firstValueFrom(value) : value;
  }

  it('allows a dashboard without patient context and makes no lookup', () => {
    expect(enter({})).toBeTrue();
    expect(encounters.resolve).not.toHaveBeenCalled();
  });

  it('does not fetch or activate after authentication was rejected', () => {
    storage.isLoggedIn = () => false;
    expect(enter({ ...complete, lfdnr: '' })).toBeFalse();
    expect(encounters.resolve).not.toHaveBeenCalled();
  });

  it('preserves a complete link including its explicitly selected historical movement', () => {
    expect(enter({ ...complete, lfdnr: '00002' })).toBeTrue();
    expect(encounters.resolve).not.toHaveBeenCalled();
  });

  it('normalizes short identifiers without changing a valid movement', () => {
    const tree = enter({ patnr: '156', einri: '1000', falnr: '11612', lfdnr: '2' }) as UrlTree;
    expect(tree.queryParams.lfdnr).toBe('00002');
    expect(tree.queryParams.falnr).toBe(complete.falnr);
    expect(encounters.resolve).not.toHaveBeenCalled();
  });

  for (const movement of [undefined, '', 'undefined', 'null', 'abc', '00000', '123456']) {
    it(`resolves missing or invalid movement ${movement}`, async () => {
      const params: any = { ...complete };
      if (movement === undefined) { delete params.lfdnr; } else { params.lfdnr = movement; }
      const tree = await result(params) as UrlTree;
      expect(encounters.resolve).toHaveBeenCalledWith(complete.patnr, complete.einri, complete.falnr);
      expect(tree.queryParams).toEqual({ nav: 'Treatmentarea', action: 'view', ...complete });
      expect(tree.fragment).toBe('orders');
      expect(enter(tree.queryParams)).toBeTrue();
    });
  }

  it('waits for the encounter before allowing a redirect', () => {
    const pending = new Subject<any>();
    encounters.resolve.and.returnValue(pending);
    const next = jasmine.createSpy();
    const value = enter({ ...complete, lfdnr: '' });
    if (!isObservable(value)) { fail('Expected asynchronous resolution'); return; }
    value.subscribe(next);
    expect(next).not.toHaveBeenCalled();
    pending.next(resolved);
    expect(next.calls.mostRecent().args[0] instanceof UrlTree).toBeTrue();
  });

  it('blocks failed or mismatched case resolution with a generic message', async () => {
    encounters.resolve.and.returnValue(throwError(() => new Error('private upstream details')));
    expect(await result({ ...complete, lfdnr: '' })).toBeFalse();
    expect(Swal.fire).toHaveBeenCalled();
    expect(JSON.stringify((Swal.fire as jasmine.Spy).calls.mostRecent().args)).not.toContain('private upstream');
  });

  for (const params of [{ nav: 'Treatmentarea' }, { ...complete, patnr: '' }, { ...complete, falnr: 'bad' }, { ...complete, einri: ['1000', '2000'] }]) {
    it(`rejects incomplete or ambiguous identity ${JSON.stringify(params)}`, () => {
      expect(enter(params)).toBeFalse();
      expect(encounters.resolve).not.toHaveBeenCalled();
    });
  }

  it('redirects an incomplete URL before activating the patient screen', async () => {
    const pending = new Subject<any>();
    encounters.resolve.and.returnValue(pending);
    router.resetConfig([{ path: 'patient', component: PatientScreen,
      canActivate: [PatientEncounterGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange' }]);
    const fixture = TestBed.createComponent(EntryHost);
    fixture.detectChanges();
    const navigation = fixture.ngZone.run(() => router.navigateByUrl(
      '/patient?patnr=156&einri=1000&falnr=11612&nav=Treatmentarea'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('ng-component')).toBeNull();
    pending.next(resolved);
    pending.complete();
    await navigation;
    fixture.detectChanges();
    expect(router.parseUrl(router.url).queryParams).toEqual({ ...complete, nav: 'Treatmentarea' });
    expect(fixture.nativeElement.querySelector('ng-component')).not.toBeNull();
    expect(encounters.resolve).toHaveBeenCalledTimes(1);
  });

  it('protects all intended routes after their existing authorization guards and reruns for query changes', () => {
    const paths = ['nursing-inpatient-dashboard', 'nursing-emergncy-dashboard', 'day-case-dashboard',
      'out-patient-nursing', 'dialysis-nursing-dashboard', 'labreception-dashboard',
      'emergencydashboard', 'e-kardex', 'radiologist-ekardex'];
    for (const path of paths) {
      const route = rootRoutes.find(candidate => candidate.path === path);
      expect(route.canActivate.length).toBe(2);
      expect(route.canActivate[1]).toBe(PatientEncounterGuard);
      expect(route.runGuardsAndResolvers).toBe('paramsOrQueryParamsChange');
    }
  });
});
