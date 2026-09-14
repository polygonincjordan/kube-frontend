import { fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { ActionType } from '@services/interfaces/common.enum';
import { EmergencyNursingDocumentComponent } from './emergency-nursing-document.component';

// The constructor only needs a query-param stream, an action-type stream and a
// handful of stubs, so the component is built directly rather than through
// TestBed. That keeps this spec about one thing: which patient the document
// takes its identity from.

// Omar Aboudiak, the patient this tab's route points at.
const ROUTE_PARAMS = {
  einri: '1000',
  patnr: '0000000045',
  falnr: '0000013107',
  lfdnr: '1'
};

const OWN_CHECK_IN_DATA = {
  Einri: '1000',
  Patnr: '0000000045',
  Falnr: '0000013107',
  ZeitIntern: 'PT10H36M00S'
};

// Farajj Nidal Mohammad Salman, case 13105, left in localStorage by another
// browser tab. This is the row that leaked onto case 13107 on QA.
const OTHER_PATIENT_CHECK_IN_DATA = {
  Einri: '1000',
  Patnr: '0000000039',
  Falnr: '0000013105',
  ZeitIntern: 'PT16H34M59S'
};

function buildComponent(routeParams: any = ROUTE_PARAMS) {
  const actionsType$ = new Subject<any>();

  const storage: any = {
    setEinri: () => {},
    setFalnr: () => {},
    setLfdnr: () => {},
    setPatnr: () => {},
    setPatientData: () => {},
    getGpart: () => '9000000050',
    getUserProfile: () => ({ Gpart: '9000000050' })
  };
  const route: any = { queryParams: of(routeParams) };
  const patientService: any = { getDataPatient: () => of({}) };
  const emergencyService: any = {
    getSocialHabitList: () => of({ d: { results: [] } }),
    triagePriorityList: () => of({ d: { results: [] } })
  };
  const shared: any = { waringSwallModel: () => {}, successSwallModel: () => {} };
  const dataShare: any = { actionsType$, sendActionType: () => {} };
  const ePrescription: any = {};
  const modalService: any = { show: () => ({ hide: () => {} }) };

  const component = new EmergencyNursingDocumentComponent(
    storage,
    new FormBuilder(),
    patientService,
    route,
    emergencyService,
    shared,
    dataShare,
    ePrescription,
    modalService
  );
  component.ngOnInit();
  return { component, actionsType$ };
}

// Drives the real "Create" path: the parent dispatches an Add action, and the
// document patches its form 1500ms later.
function createNewDocument(component: any, actionsType$: Subject<any>) {
  actionsType$.next({ type: ActionType.Add$, isAllow: true, value: '' });
  tick(1500);
}

describe('EmergencyNursingDocumentComponent', () => {
  afterEach(() => {
    localStorage.removeItem('checkindata');
  });

  describe('patient identity on a new document', () => {
    it('ignores a check-in row left behind by another patient', fakeAsync(() => {
      localStorage.setItem('checkindata', JSON.stringify(OTHER_PATIENT_CHECK_IN_DATA));
      const { component, actionsType$ } = buildComponent();

      createNewDocument(component, actionsType$);

      expect(component.selectedTableDetails).toBeNull();
    }));

    it('leaves arrival time empty rather than showing the other patient time', fakeAsync(() => {
      localStorage.setItem('checkindata', JSON.stringify(OTHER_PATIENT_CHECK_IN_DATA));
      const { component, actionsType$ } = buildComponent();

      createNewDocument(component, actionsType$);

      // 16:34:59 is case 13105's arrival time and must never reach case 13107.
      expect(component.triageForm.get('ArrivalTime')?.value).toBeNull();
    }));

    it('still pre-fills arrival time from this patient own check-in row', fakeAsync(() => {
      localStorage.setItem('checkindata', JSON.stringify(OWN_CHECK_IN_DATA));
      const { component, actionsType$ } = buildComponent();

      createNewDocument(component, actionsType$);

      expect(component.selectedTableDetails).toEqual(OWN_CHECK_IN_DATA);
      expect(component.triageForm.get('ArrivalTime')?.value).toBe('10:36:00');
    }));

    it('matches the patient even when the route carries unpadded identifiers', fakeAsync(() => {
      localStorage.setItem('checkindata', JSON.stringify(OWN_CHECK_IN_DATA));
      const { component, actionsType$ } = buildComponent({
        einri: '1000',
        patnr: '45',
        falnr: '13107',
        lfdnr: '1'
      });

      createNewDocument(component, actionsType$);

      expect(component.triageForm.get('ArrivalTime')?.value).toBe('10:36:00');
    }));

    it('survives a malformed check-in entry', fakeAsync(() => {
      localStorage.setItem('checkindata', 'not json');
      const { component, actionsType$ } = buildComponent();

      expect(() => createNewDocument(component, actionsType$)).not.toThrow();
      expect(component.selectedTableDetails).toBeNull();
    }));

    it('keeps the form bound to the route patient', fakeAsync(() => {
      localStorage.setItem('checkindata', JSON.stringify(OTHER_PATIENT_CHECK_IN_DATA));
      const { component, actionsType$ } = buildComponent();

      createNewDocument(component, actionsType$);

      expect(component.triageForm.get('Patnr')?.value).toBe('0000000045');
      expect(component.triageForm.get('Falnr')?.value).toBe('0000013107');
    }));
  });

  describe('social habit identity', () => {
    // These payloads are written straight to SAP, so the identifiers handed to
    // the modal decide whose record the habit lands on.
    it('sends the route patient to the habit modal, not the cached one', fakeAsync(() => {
      localStorage.setItem('checkindata', JSON.stringify(OTHER_PATIENT_CHECK_IN_DATA));
      const { component, actionsType$ } = buildComponent();
      createNewDocument(component, actionsType$);

      const openModalForAddHabit = jasmine.createSpy('openModalForAddHabit');
      component.socialAddHabit = { openModalForAddHabit } as any;

      component.openModelForAddHabitSocial(0, { label: 'Alcohol', Status: '' });

      expect(openModalForAddHabit).toHaveBeenCalled();
      expect(openModalForAddHabit.calls.mostRecent().args[1]).toEqual({
        Einri: '1000',
        Patnr: '0000000045'
      });
    }));

    it('sends the route patient even when no check-in row is cached', fakeAsync(() => {
      const { component, actionsType$ } = buildComponent();
      createNewDocument(component, actionsType$);

      const openModalForAddHabit = jasmine.createSpy('openModalForAddHabit');
      component.socialAddHabit = { openModalForAddHabit } as any;

      component.openModelForAddHabitSocial(0, { label: 'Tobacco', Status: '' });

      expect(openModalForAddHabit.calls.mostRecent().args[1]).toEqual({
        Einri: '1000',
        Patnr: '0000000045'
      });
    }));
  });
});
