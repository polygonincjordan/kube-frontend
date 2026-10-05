import { DatePipe } from '@angular/common';
import { FormArray, FormGroup } from '@angular/forms';
import { EMPTY, of } from 'rxjs';
import { CreateAdministrationComponent } from './administration/create-administration/create-administration.component';
import { EditMedicationComponent } from './prior-admission/edit-medication/edit-medication.component';
import { CreateAdministrationComponent as EmergencyCreateAdministrationComponent } from '../emergency-dashboard/e-prescription/administration/create-administration/create-administration.component';
import { EditMedicationComponent as EmergencyEditMedicationComponent } from '../emergency-dashboard/e-prescription/prior-admission/edit-medication/edit-medication.component';

['Inpatient', 'Emergency'].forEach(dashboard => describe(`${dashboard} medication frequency changes`, () => {
  let create: CreateAdministrationComponent | EmergencyCreateAdministrationComponent;
  let edit: EditMedicationComponent | EmergencyEditMedicationComponent;
  let prescriptionService: any;
  const startDate = new Date(2030, 0, 1, 8);
  const endDate = new Date(2030, 0, 3, 8);
  const frequencies = ['Q12H', 'DEFTIM', 'DAILY', 'STAT', 'ONCE'];

  function changeEditFrequency(frequency: string) {
    if (edit instanceof EmergencyEditMedicationComponent) {
      edit.onChangeFrequencySet();
    } else {
      edit.onChangeFrequencySet(frequency);
    }
  }

  function seed(form: FormGroup) {
    form.patchValue({
      Result_Drug_Name: 'Test medication', Phformid: 'TABLET', Routedescr: 'ORAL',
      Quan: 1, Quanunit: 'EA', N1znr: 'Q12H', Dosdef: '',
      Pdur: 2, Pduru: 'TAG', StartD: new Date(startDate), EndD: new Date(endDate), EndT: 'PT08H00M00S',
    });
  }

  function expectSingleDoseDefault(form: FormGroup) {
    expect(form.value.Pdur).toBe(1);
    expect(form.value.Pduru).toBe('DOS');
    expect(form.value.EndD).toEqual(new Date(2030, 0, 2, 8));
    expect(form.value.StartD).toEqual(startDate);
  }

  function expectCleared(form: FormGroup) {
    expect(form.value.Pdur).toBe('');
    expect(form.value.Pduru).toBeNull();
    expect(form.value.EndD).toBeNull();
    expect(form.value.EndT).toBe('');
    expect(form.value.StartD).toEqual(startDate);
    expect(form.value.Quan).toBe(1);
    expect(form.value.Quanunit).toBe('EA');
  }

  beforeEach(() => {
    prescriptionService = {
      parameters: {}, loadParameters: () => ({}),
      loadData: jasmine.createSpy('loadData').and.returnValue(of({
        body: { d: { results: [{ Rcode: 'END', Rcodeid: 'END' }] } },
      })),
      postData: jasmine.createSpy('postData').and.returnValue(EMPTY),
    };
    const administrationService: any = {
      frequencyList: frequencies.map(N1id => ({ CycleKey: N1id, N1id })),
      medicationAdministrative: {},
      getStatFrequency: () => ({ CycleKey: 'STAT', N1id: 'STAT' }),
    };
    const CreateComponent = dashboard === 'Emergency' ? EmergencyCreateAdministrationComponent : CreateAdministrationComponent;
    const EditComponent = dashboard === 'Emergency' ? EmergencyEditMedicationComponent : EditMedicationComponent;
    create = new CreateComponent(null, prescriptionService, null, administrationService, null);
    create.administrationForm = new FormGroup({ AdministrationData: new FormArray([]) });
    create.drugArray.push(create.generateForm());
    seed(create.drugArray.at(0) as FormGroup);

    edit = new EditComponent(null, prescriptionService, new DatePipe('en-US'), administrationService);
    edit.editdata = { ...create.drugArray.at(0).value };
    spyOn(edit, 'onSelectMedicine');
    edit.ngOnInit();
  });

  for (const screen of ['create', 'edit']) {
    const changeFrequency = (form: FormGroup, frequency: string) => {
      form.patchValue({ N1znr: frequency });
      screen === 'create' ? create.onChangeFrequencySet(frequency, 0) : changeEditFrequency(frequency);
    };

    for (const frequency of ['Q12H', 'DEFTIM', 'DAILY', null]) {
      it(`${screen}: clears duration and end date when frequency changes to ${frequency}`, () => {
        const form = (screen === 'create' ? create.drugArray.at(0) : edit.editprofileForm) as FormGroup;
        changeFrequency(form, frequency);
        expectCleared(form);
      });
    }

    for (const frequency of ['STAT', 'ONCE']) {
      it(`${screen}: replaces the previous duration with the ${frequency} default`, () => {
        const form = (screen === 'create' ? create.drugArray.at(0) : edit.editprofileForm) as FormGroup;
        changeFrequency(form, frequency);
        expectSingleDoseDefault(form);
      });

      it(`${screen}: clears the ${frequency} default when the frequency changes again`, () => {
        const form = (screen === 'create' ? create.drugArray.at(0) : edit.editprofileForm) as FormGroup;
        changeFrequency(form, frequency);
        changeFrequency(form, 'Q12H');
        expectCleared(form);
      });
    }
  }

  it('keeps saved duration and end date when opening the edit screen or frequency dropdown', () => {
    if (edit instanceof EditMedicationComponent) { edit.onOpenFrequencySet(); }
    expect(edit.editprofileForm.value.Pdur).toBe(2);
    expect(edit.editprofileForm.value.Pduru).toBe('TAG');
    expect(edit.editprofileForm.value.EndD).toEqual(endDate);
  });

  it('only clears the medication row whose frequency changed', () => {
    const otherRow = create.generateForm();
    seed(otherRow);
    create.drugArray.push(otherRow);
    const before = otherRow.value;
    create.onChangeFrequencySet('DEFTIM', 0);
    expect(otherRow.value).toEqual(before);
  });

  for (const useExistingRow of [true, false]) {
    it(`preserves template duration when loading into ${useExistingRow ? 'an existing' : 'a new'} row`, () => {
      const template = { ...create.drugArray.at(0).value, Pdur: '2', Pduru: 'TAG' };
      if (!useExistingRow) { create.drugArray.clear(); }
      spyOn(create, 'openMoDetailPanel');
      create.processTemplateData([template]);
      expect(create.drugArray.at(0).value.Pdur).toBe('2');
      expect(create.drugArray.at(0).value.Pduru).toBe('TAG');
      expect(create.drugArray.at(0).value.EndD).not.toBeNull();
      create.onChangeFrequencySet('DEFTIM', 0);
      expect(create.drugArray.at(0).value.EndD).toBeNull();
      expect(create.drugArray.at(0).value.Pdur).toBe('');
    });
  }

  it('submits empty duration and end date for a changed new order', () => {
    create.drugArray.at(0).patchValue({ N1znr: 'DEFTIM' });
    create.onChangeFrequencySet('DEFTIM', 0);
    create.onSubmitData();
    const order = prescriptionService.postData.calls.mostRecent().args[1].TOSTD[0];
    expect(order.Pdur).toBe('0');
    expect(order.Pduru).toBe('');
    expect(order.EndD).toBeNull();
  });

  for (const frequency of ['STAT', 'ONCE']) {
    it(`retains single-dose defaults when loading a ${frequency} template`, () => {
      const template = { ...create.drugArray.at(0).value, N1znr: frequency };
      spyOn(create, 'openMoDetailPanel');
      create.processTemplateData([template]);
      const form = create.drugArray.at(0);
      expect(form.value.Pdur).toBe(1);
      expect(form.value.Pduru).toBe('DOS');
      expect(form.value.IsFrequencyDeftim).toBe(false);
      expect(form.value.Dosdef).toBe('');
    });
  }

  it('submits cleared values for an edited order', () => {
    edit.editprofileForm.patchValue({ N1znr: 'DEFTIM' });
    changeEditFrequency('DEFTIM');
    edit.onEditAction();
    const order = prescriptionService.postData.calls.mostRecent().args[1];
    expect(order.Pdur).toBe('');
    expect(order.Pduru).toBeNull();
    expect(order.EndD).toBeNull();
    expect(order.EndT).toBeNull();
  });
  if (dashboard === 'Emergency') {
    it('retains the initial STAT default and clears it when the physician changes frequency', () => {
      const form = create.drugArray.at(0) as FormGroup;
      form.patchValue({ N1znr: null, Pdur: '', Pduru: null, EndD: null });
      (create as EmergencyCreateAdministrationComponent).applyStatDefault(form);
      expect(form.value.N1znr).toBe('STAT');
      expect(form.value.Pdur).toBe(1);
      expect(form.value.Pduru).toBe('DOS');
      form.patchValue({ N1znr: 'DEFTIM' });
      create.onChangeFrequencySet('DEFTIM', 0);
      expectCleared(form);
      (create as EmergencyCreateAdministrationComponent).applyStatDefault(form);
      expectCleared(form);
    });
  }
}));
