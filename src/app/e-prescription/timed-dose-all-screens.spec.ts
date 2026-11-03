import { DatePipe } from '@angular/common';
import { FormArray, FormGroup } from '@angular/forms';
import { EMPTY, of } from 'rxjs';
import swal from 'sweetalert2';
import { CreateAdministrationComponent } from './administration/create-administration/create-administration.component';
import { PlannedAdministrationComponent } from './to-admission/planned-administration/planned-administration.component';
import { PriorToAdmissionComponent } from './to-admission/prior-to-admission/prior-to-admission.component';
import { CreateDischargeOrderComponent } from './discharge-order/create-discharge-order/create-discharge-order.component';
import { EditMedicationComponent } from './prior-admission/edit-medication/edit-medication.component';
import { EditPriortoAdmissionlistComponent } from './prior-admission/priorto-admissionlist/edit-priorto-admissionlist/edit-priorto-admissionlist.component';
import { CreateAdministrationComponent as EmergencyCreate } from '../emergency-dashboard/e-prescription/administration/create-administration/create-administration.component';
import { CreateDischargeOrderComponent as EmergencyDischarge } from '../emergency-dashboard/e-prescription/discharge-order/create-discharge-order/create-discharge-order.component';
import { EditMedicationComponent as EmergencyEditMedication } from '../emergency-dashboard/e-prescription/prior-admission/edit-medication/edit-medication.component';
import { EditPriortoAdmissionlistComponent as EmergencyEditPriorto } from '../emergency-dashboard/e-prescription/prior-admission/priorto-admissionlist/edit-priorto-admissionlist/edit-priorto-admissionlist.component';
import { CreateAdministrationComponent as NursingEmergencyCreate } from '../nursing-dashboard/emergency-dashboard/e-prescription/administration/create-administration/create-administration.component';
import { CreateDischargeOrderComponent as NursingEmergencyDischarge } from '../nursing-dashboard/emergency-dashboard/e-prescription/discharge-order/create-discharge-order/create-discharge-order.component';
import { EditMedicationComponent as NursingEmergencyEditMedication } from '../nursing-dashboard/emergency-dashboard/e-prescription/prior-admission/edit-medication/edit-medication.component';
import { EditPriortoAdmissionlistComponent as NursingEmergencyEditPriorto } from '../nursing-dashboard/emergency-dashboard/e-prescription/prior-admission/priorto-admissionlist/edit-priorto-admissionlist/edit-priorto-admissionlist.component';
import { CreateDischargeOrderComponent as DischargeProcessDischarge } from '../discharge-process/discharge-order/create-discharge-order/create-discharge-order.component';
import { PremedicationsComponent } from '../chemotherapy/premedications/premedications.component';
import { ChemotherapeuticBiologicComponent } from '../chemotherapy/chemotherapeutic-biologic/chemotherapeutic-biologic.component';
import { ChemoDischargeComponent } from '../chemotherapy/chemo-discharge/chemo-discharge.component';
import { ChemotherapyComponent } from '../chemotherapy/chemotherapy.component';

const frequencies = [
  { CycleKey: '0000000002', N1id: 'Q12H', Text: 'Q12H', OptionField: 'Q12H' },
  { CycleKey: '0000000003', N1id: 'DAILY', Text: 'DAILY', OptionField: 'DAILY' },
  { CycleKey: '0000000100', N1id: 'DEFTIM', Text: 'Defined Timing', OptionField: 'Defined Timing' },
];
const DEFTIM = '0000000100';
const Q12H = '0000000002';
const units = () => [
  { Agentid: 'A1', Mseht: 'ML', Agent: '', Meinh: 'ML', Quant: '5.000' },
  { Agentid: 'A2', Mseht: 'MG', Agent: '', Meinh: 'MG', Quant: '250.000' },
];
const at = (hour: number) => new Date(2030, 0, 1, hour);

interface Screen {
  name: string;
  build: (prescription: any, administration: any) => any;
  /** Discharge screens keep the chosen frequency key in N1ztxt and read their own frequency list. */
  discharge?: boolean;
  /** How the screen's medicine search emits a selection. */
  medicine: (index: number) => any;
  /** Whether the unit dropdown emits the unit or its Meinh; absent when the screen has no unit handler. */
  unitEvent?: (unit: any) => any;
  /** The order post this screen sends, when it sends one itself. */
  post?: { path: string; key: string; submit: (screen: any) => void };
}

const createMedicine = (index: number) => ({ data: { Agentid: 'A1', Drugid: 'D1', Drugname: 'Test medication', Formatdescr: 'Tablet' }, index });
const dischargeMedicine = (index: number) => ({ data: 'D1', index, medicationDruglist: [{ Drugid: 'D1', Agentid: 'A1', Drugname: 'Test medication', Formatdescr: 'Tablet' }] });
const cdr = { detectChanges: () => {} };

const screens: Screen[] = [
  { name: 'Inpatient create order', build: (p, a) => new CreateAdministrationComponent(null, p, null, a, cdr as any), medicine: createMedicine, unitEvent: u => u,
    post: { path: 'EstdordSet', key: 'TOSTD', submit: s => s.onSubmitData() } },
  { name: 'Emergency create order', build: (p, a) => new EmergencyCreate(null, p, null, a, cdr as any), medicine: createMedicine, unitEvent: u => u,
    post: { path: 'EstdordSet', key: 'TOSTD', submit: s => s.onSubmitData() } },
  { name: 'Nursing emergency create order', build: (p, a) => new NursingEmergencyCreate(p, null, a), medicine: createMedicine, unitEvent: u => u.Meinh,
    post: { path: 'EstdordSet', key: 'TOSTD', submit: s => s.onSubmitData() } },
  { name: 'Planned administration', build: (p, a) => new PlannedAdministrationComponent(null, null, p, null, a, cdr as any), medicine: createMedicine, unitEvent: u => u.Meinh },
  { name: 'Prior to admission', build: (p, a) => new PriorToAdmissionComponent(null, p, null, a, cdr as any), medicine: createMedicine, unitEvent: u => u.Meinh },
  { name: 'Chemotherapy premedications', build: (p, a) => new PremedicationsComponent(null, p, {} as any, null, a, cdr as any), medicine: createMedicine, unitEvent: u => u.Meinh },
  { name: 'Chemotherapeutic / biologic agents', build: (p, a) => new ChemotherapeuticBiologicComponent(null, p, {} as any, null, a, cdr as any), medicine: createMedicine, unitEvent: u => u.Meinh,
    post: { path: 'EstdordSet', key: 'TOSTD', submit: s => s.onSubmitData() } },
  { name: 'Inpatient discharge order', discharge: true, build: (p, a) => new CreateDischargeOrderComponent(p, null, a, cdr as any), medicine: dischargeMedicine, unitEvent: u => u.Meinh,
    post: { path: 'EorderSet', key: 'TODISCH', submit: s => s.onSubmitData() } },
  { name: 'Emergency discharge order', discharge: true, build: (p, a) => new EmergencyDischarge(p, a, null, null, null, null, cdr as any), medicine: dischargeMedicine,
    post: { path: 'EorderSet', key: 'TODISCH', submit: s => s.onSubmitData() } },
  { name: 'Discharge process order', discharge: true, build: (p, a) => new DischargeProcessDischarge(p, null, a, cdr as any), medicine: dischargeMedicine, unitEvent: u => u.Meinh,
    post: { path: 'EorderSet', key: 'TODISCH', submit: s => s.onSubmitData() } },
  { name: 'Chemotherapy discharge', discharge: true, build: (p, a) => new ChemoDischargeComponent(p, null, a, {} as any, cdr as any), medicine: dischargeMedicine, unitEvent: u => u.Meinh },
];

function services() {
  const unitList = { body: { d: { results: units() } } };
  const prescription: any = {
    parameters: { einri: 'E1', falnr: 'C1', lfdnr: '1' }, loadParameters: () => ({}),
    loadData: jasmine.createSpy('loadData').and.callFake((url: string) => {
      if (url === 'DrugPropSet') {
        return of({ body: { d: { results: [{ AgentID: 'A1', DrugID: 'D1', NAVDRUGFORMATROUTEUNITS: { results: [] }, NAVDRUGFORMATROUTES: { results: [{ FormID: 'TABLET' }] } }] } } });
      }
      if (typeof url === 'string' && url.startsWith('e-prescription/DurgUnitlist')) { return of(unitList); }
      return EMPTY;
    }),
    postData: jasmine.createSpy('postData').and.returnValue(EMPTY),
    drugArrayActions$: { next: () => {}, getValue: () => ({ value: [] }), subscribe: () => {} },
  };
  const administration: any = {
    frequencyList: frequencies,
    medicationAdministrative: { EmpResp: 'P1', OrderingDept: 'D1', OrderingTo: 'W1' },
    durationUnitList: [{ Unit: 'TAG', Text: 'Days' }],
    getStatFrequency: () => null,
  };
  return { prescription, administration };
}

screens.forEach(screen => describe(`${screen.name}: dose and timing table`, () => {
  let component: any;
  let prescription: any;

  const row = () => component.drugArray.at(0) as FormGroup;
  const frequencyControl = screen.discharge ? 'N1ztxt' : 'N1znr';
  const chooseFrequency = (key: string) => {
    row().patchValue({ [frequencyControl]: key });
    component.onChangeFrequencySet(key, 0);
  };
  const enterDose = (dose: any) => { row().patchValue({ Quan: dose }); row().markAsTouched(); };
  const completeRow = () => {
    row().patchValue({
      Result_Drug_Name: 'Test medication', Phformid: 'TABLET', Routedescr: { Descr: 'ORAL', Aprouid: 'PO' },
      Quanunit: screen.discharge ? 'MG' : units()[1], StartD: new Date(2030, 0, 1, 8), Complex: '', Pdur: '2', Pduru: 'TAG',
      AgentidResult: units(),
    });
    // Any other required field of this screen gets a placeholder so only the dose decides validity.
    Object.keys(row().controls).forEach(name => {
      const control = row().get(name);
      if (name !== 'Quan' && control.errors && control.errors.required) { control.setValue('X'); }
    });
    row().markAsTouched();
  };
  const order = () => prescription.postData.calls.all().filter(c => c.args[0] === screen.post.path).pop().args[1][screen.post.key][0];
  const popupText = () => (swal.fire as jasmine.Spy).calls.mostRecent().args[0].text;

  beforeEach(() => {
    spyOn(swal, 'fire').and.returnValue(Promise.resolve({ value: false }) as any);
    const deps = services();
    prescription = deps.prescription;
    component = screen.build(deps.prescription, deps.administration);
    component.frequencyList = frequencies;
    if (screen.discharge) {
      component.MedicationForm = new FormGroup({ MedicationData: new FormArray([]) });
    } else {
      component.administrationForm = new FormGroup({ AdministrationData: new FormArray([]) });
    }
    component.drugArray.push(component.generateForm());
  });

  it('starts a new row with an empty, required dose', () => {
    expect(row().value.Quan).toBe('');
    expect(row().get('Quan').errors).toEqual({ required: true });
  });

  it('does not fill the dose from the unit default when a medicine is selected', () => {
    enterDose('150');
    component.onSelectMedicine(screen.medicine(0));
    expect(row().value.Quan).toBe('');
  });

  if (screen.unitEvent) {
    it('keeps an entered fractional dose when the unit changes', () => {
      component.onSelectMedicine(screen.medicine(0));
      enterDose('1.5');
      row().patchValue({ AgentidResult: units() });
      component.onChangeDosageUnit(units(), screen.unitEvent(units()[1]), 0);
      expect(row().value.Quan).toBe('1.5');
      expect(row().value.Agentid).toBe('A2');
    });
  }

  {
    it('moves the entered dose into the first time of a new DEFTIM schedule', () => {
      completeRow();
      enterDose('150');
      chooseFrequency(DEFTIM);
      expect(row().value.deftimcycleData.map(d => d.deftimDose)).toEqual(['150']);
      expect(row().value.Dosdef).toBe('150(08:00)');
      expect(row().value.Quan).toBe('150');
      expect(component.isTimedSchedule(row())).toBe(true);
    });

    it('keeps every saved time and fraction when DEFTIM is chosen again', () => {
      completeRow();
      row().patchValue({ Dosdef: '0(08:00)-1.5(12:00)-2.75(20:00)', Quan: '9' });
      chooseFrequency(DEFTIM);
      expect(row().value.deftimcycleData.map(d => d.deftimDose)).toEqual(['1.5', '2.75']);
      expect(row().value.Quan).toBe('1.5');
      expect(row().value.Dosdef).toBe('0(08:00)-1.5(12:00)-2.75(20:00)');
    });

    it('takes fractional doses from the timing table without rounding', () => {
      completeRow();
      chooseFrequency(DEFTIM);
      component.FrequencySetcycle([
        { deftimDose: 1.5, deftimDosageUnit: 'MG', deftimTime: at(8), Agentid: 'A2' },
        { deftimDose: 2.75, deftimDosageUnit: 'MG', deftimTime: at(20), Agentid: 'A2' },
      ], 0, units());
      expect(row().value.Quan).toBe(1.5);
      expect(row().value.Dosdef).toBe('1.5(08:00)-2.75(20:00)');
    });

    it('names an incomplete time and blocks the order', () => {
      completeRow();
      chooseFrequency(DEFTIM);
      component.FrequencySetcycle([
        { deftimDose: 150, deftimDosageUnit: 'MG', deftimTime: at(8), Agentid: 'A2' },
        { deftimDose: null, deftimDosageUnit: 'MG', deftimTime: at(20), Agentid: 'A2' },
      ], 0, units());
      expect(component.showTimedScheduleErrors()).toBe(true);
      expect(popupText()).toBe('Missing Test medication: row 2 (20:00): Dose');
      expect(row().value.IsFrequencyDeftim).toBe(true);
      if (screen.post) {
        prescription.postData.calls.reset();
        screen.post.submit(component);
        expect(prescription.postData.calls.all().filter(c => c.args[0] === screen.post.path).length).toBe(0);
      }
    });
  }

  if (screen.post) {
    it('sends every dose of a complete schedule as entered', () => {
      completeRow();
      chooseFrequency(DEFTIM);
      component.FrequencySetcycle([
        { deftimDose: 1.5, deftimDosageUnit: 'MG', deftimTime: at(8), Agentid: 'A2' },
        { deftimDose: 2.75, deftimDosageUnit: 'MG', deftimTime: at(20), Agentid: 'A2' },
      ], 0, units());
      screen.post.submit(component);
      expect(order().Quan).toBe('1.5');
      expect(order().Dosdef).toBe('1.5(08:00)-2.75(20:00)');
    });

    it('does not send a schedule left from DEFTIM with a regular frequency', () => {
      completeRow();
      enterDose('150');
      chooseFrequency(DEFTIM);
      chooseFrequency(Q12H);
      expect(component.isTimedSchedule(row())).toBe(false);
      screen.post.submit(component);
      expect(order().Dosdef).toBe('');
      expect(order().Quan).toBe('150');
    });
  }
}));

describe('Orders sent by a parent screen: timing table check', () => {
  beforeEach(() => spyOn(swal, 'fire').and.returnValue(Promise.resolve({ value: false }) as any));

  function incompleteRows(component: any) {
    component.administrationForm = new FormGroup({ AdministrationData: new FormArray([]) });
    component.drugArray.push(component.generateForm());
    const row = component.drugArray.at(0) as FormGroup;
    row.patchValue({ Result_Drug_Name: 'Test medication', N1znr: DEFTIM, deftimcycleData: [{ deftimDose: '', deftimDosageUnit: 'MG', deftimTime: at(8) }] });
    row.markAsTouched();
  }

  it('prior to admission does not save while a planned order has an incomplete timing table', () => {
    const { prescription, administration } = services();
    const prior: any = new PriorToAdmissionComponent(null, prescription, null, administration, cdr as any);
    prior.administrationForm = new FormGroup({ AdministrationData: new FormArray([]) });
    const planned: any = new PlannedAdministrationComponent(null, null, prescription, null, administration, cdr as any);
    incompleteRows(planned);
    prior.template = planned;
    prior.onSubmitData();
    expect(prescription.postData).not.toHaveBeenCalled();
    expect((swal.fire as jasmine.Spy).calls.mostRecent().args[0].text).toBe('Missing Test medication: row 1 (08:00): Dose');
  });

  it('chemotherapy does not send premedications with an incomplete timing table', () => {
    const { prescription, administration } = services();
    const premedications: any = new PremedicationsComponent(null, prescription, {} as any, null, administration, cdr as any);
    incompleteRows(premedications);
    const chemotherapy: any = Object.create(ChemotherapyComponent.prototype);
    Object.assign(chemotherapy, { addministrationService: administration, CreateEventdata: premedications.drugArray });
    const popup = spyOn(chemotherapy, 'showErrorPopup');
    chemotherapy.CreateEventData();
    expect(popup).toHaveBeenCalledWith('Complete the timing table', 'Missing Test medication: row 1 (08:00): Dose', 'Error');
  });
});

[
  { name: 'Inpatient edit medication', Component: EditMedicationComponent, timed: true },
  { name: 'Inpatient edit prior to admission', Component: EditPriortoAdmissionlistComponent, timed: true },
  { name: 'Emergency edit prior to admission', Component: EmergencyEditPriorto, timed: true },
  { name: 'Nursing emergency edit prior to admission', Component: NursingEmergencyEditPriorto, timed: true },
  { name: 'Emergency edit medication', Component: EmergencyEditMedication, timed: false },
  { name: 'Nursing emergency edit medication', Component: NursingEmergencyEditMedication, timed: false },
].forEach(({ name, Component, timed }) => describe(`${name}: saved dose`, () => {
  let edit: any;

  beforeEach(() => {
    spyOn(swal, 'fire').and.returnValue(Promise.resolve({ value: false }) as any);
    const { prescription, administration } = services();
    edit = new (Component as any)(null, prescription, new DatePipe('en-US'), administration);
    edit.editdata = {
      Result_Drug_Name: 'Test medication', Quan: '1.5', Quanunit: 'MG', Agentid: 'A2', N1znr: Q12H, N1id: 'Q12H',
      Dosdef: '', Pdur: 2, Pduru: 'TAG', StartD: new Date(2030, 0, 1, 8), EndD: new Date(2030, 0, 3, 8),
    };
    spyOn(edit, 'onSelectMedicine');
    edit.ngOnInit();
  });

  it('keeps the saved fractional dose when the unit changes', () => {
    edit.onChangeDosageUnit(units(), 'ML');
    expect(edit.editprofileForm.value.Quan).toBe('1.5');
    expect(edit.editprofileForm.value.Agentid).toBe('A1');
  });

  if (timed) {
    it('keeps every saved time and fraction when DEFTIM is chosen', () => {
      edit.editprofileForm.patchValue({ N1znr: DEFTIM, Dosdef: '0(08:00)-1.5(12:00)-2.75(20:00)' });
      edit.onChangeFrequencySet(DEFTIM);
      expect(edit.editprofileForm.value.deftimcycleData.map(d => d.deftimDose)).toEqual(['1.5', '2.75']);
      expect(edit.editprofileForm.value.Quan).toBe('1.5');
      expect(edit.isTimedSchedule()).toBe(true);
    });

    it('takes fractional doses from the timing table without rounding', () => {
      edit.editprofileForm.patchValue({ N1znr: DEFTIM });
      edit.onChangeFrequencySet(DEFTIM);
      edit.FrequencySetcycle([{ deftimDose: 2.75, deftimDosageUnit: 'MG', deftimTime: at(8), Agentid: 'A2' }], units());
      expect(edit.editprofileForm.value.Quan).toBe(2.75);
      expect(edit.editprofileForm.value.Dosdef).toBe('2.75(08:00)');
    });

    it('does not save an incomplete timing table', () => {
      edit.editprofileForm.patchValue({ N1znr: DEFTIM });
      edit.onChangeFrequencySet(DEFTIM);
      edit.FrequencySetcycle([{ deftimDose: '', deftimDosageUnit: 'MG', deftimTime: at(8), Agentid: 'A2' }], units());
      edit.ePrescriptionService.loadData.calls.reset();
      edit.onEditAction();
      expect(edit.ePrescriptionService.loadData).not.toHaveBeenCalled();
      expect((swal.fire as jasmine.Spy).calls.mostRecent().args[0].text).toBe('Missing Test medication: row 1 (08:00): Dose');
    });
  }
}));
