import { DatePipe } from '@angular/common';
import { FormArray, FormGroup } from '@angular/forms';
import { EMPTY, of } from 'rxjs';
import swal from 'sweetalert2';
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
      durationUnitList: [{ Unit: 'TAG', Text: 'Days' }, { Unit: 'DOS', Text: 'Dose' }],
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
      it(`${screen}: ${screen === 'create' ? 'clears' : 'preserves'} validity when frequency changes to ${frequency}`, () => {
        const form = (screen === 'create' ? create.drugArray.at(0) : edit.editprofileForm) as FormGroup;
        const before = form.value;
        changeFrequency(form, frequency);
        if (screen === 'create') {
          expectCleared(form);
        } else {
          expect(form.value.Pdur).toBe(before.Pdur);
          expect(form.value.Pduru).toBe(before.Pduru);
          expect(form.value.EndD).toEqual(before.EndD);
          expect(form.value.EndT).toBe(before.EndT);
        }
      });
    }

    for (const frequency of ['STAT', 'ONCE']) {
      it(`${screen}: replaces the previous duration with the ${frequency} default`, () => {
        const form = (screen === 'create' ? create.drugArray.at(0) : edit.editprofileForm) as FormGroup;
        changeFrequency(form, frequency);
        expectSingleDoseDefault(form);
      });

      it(`${screen}: ${screen === 'create' ? 'clears' : 'preserves'} the ${frequency} default when the frequency changes again`, () => {
        const form = (screen === 'create' ? create.drugArray.at(0) : edit.editprofileForm) as FormGroup;
        changeFrequency(form, frequency);
        changeFrequency(form, 'Q12H');
        screen === 'create' ? expectCleared(form) : expectSingleDoseDefault(form);
      });
    }
  }

  describe('values the physician entered', () => {
    const enter = (form: FormGroup, values: any) => {
      form.patchValue(values);
      Object.keys(values).forEach(name => form.get(name).markAsDirty());
    };
    const changeCreateFrequency = (frequency: string) => {
      create.drugArray.at(0).patchValue({ N1znr: frequency });
      create.onChangeFrequencySet(frequency, 0);
    };

    it('create: keeps an entered duration and recalculates Valid To from it', () => {
      const form = create.drugArray.at(0) as FormGroup;
      enter(form, { Pdur: '3', Pduru: 'TAG' });
      changeCreateFrequency('DAILY');
      expect(form.value.Pdur).toBe('3');
      expect(form.value.Pduru).toBe('TAG');
      expect(form.value.EndD).toEqual(new Date(2030, 0, 4, 8));
    });

    it('create: keeps a picked Valid To', () => {
      const form = create.drugArray.at(0) as FormGroup;
      const picked = new Date(2030, 0, 10, 8);
      enter(form, { EndD: picked });
      if (create instanceof CreateAdministrationComponent) {
        // Inpatient derives the duration from the picked date, so it is kept with it.
        create.ChangeDate(0, form.value);
      }
      changeCreateFrequency('Q12H');
      expect(form.value.EndD).toEqual(picked);
      if (create instanceof CreateAdministrationComponent) {
        expect(form.value.Pdur).toBe('10');
        expect(form.value.Pduru).toBe('TAG');
      } else {
        expect(form.value.Pdur).toBe('');
        expect(form.value.Pduru).toBeNull();
      }
    });

    for (const frequency of ['STAT', 'ONCE']) {
      it(`create: ${frequency} default replaces entered values and is cleared on the next change`, () => {
        const form = create.drugArray.at(0) as FormGroup;
        enter(form, { Pdur: '3', Pduru: 'TAG', EndD: new Date(2030, 0, 10, 8) });
        changeCreateFrequency(frequency);
        expectSingleDoseDefault(form);
        changeCreateFrequency('Q12H');
        expectCleared(form);
      });
    }

    it('edit: preserves entered values when the frequency changes', () => {
      const form = edit.editprofileForm;
      enter(form, { Pdur: '3', Pduru: 'TAG', EndD: new Date(2030, 0, 10, 8) });
      form.patchValue({ N1znr: 'DAILY' });
      changeEditFrequency('DAILY');
      expect(form.value.Pdur).toBe('3');
      expect(form.value.Pduru).toBe('TAG');
      expect(form.value.EndD).toEqual(new Date(2030, 0, 10, 8));
    });
  });

  describe('create priority', () => {
    const statPriority = dashboard === 'Emergency' ? '030' : '020';
    const oncePriority = dashboard === 'Emergency' ? '030' : '010';
    let form: FormGroup;
    const changeTo = (frequency: string) => {
      form.patchValue({ N1znr: frequency });
      create.onChangeFrequencySet(frequency, 0);
    };
    const setAdditionalDose = (ticked: boolean) => {
      form.patchValue({ AddDose: ticked });
      create.applyDefaultPriority(form);
    };
    const choosePriority = (priority: string) => {
      form.patchValue({ Priority: priority });
      form.get('Priority').markAsDirty();
    };

    beforeEach(() => form = create.drugArray.at(0) as FormGroup);

    it('applies the STAT and ONCE default priority', () => {
      changeTo('STAT');
      expect(form.value.Priority).toBe(statPriority);
      changeTo('ONCE');
      expect(form.value.Priority).toBe(oncePriority);
    });

    for (const frequency of ['Q12H', 'DEFTIM', 'DAILY']) {
      it(`returns to Regular when STAT changes to ${frequency}`, () => {
        changeTo('STAT');
        changeTo(frequency);
        expect(form.value.Priority).toBe('010');
      });
    }

    it('keeps a chosen priority when the new frequency has no default', () => {
      choosePriority('030');
      changeTo('DAILY');
      expect(form.value.Priority).toBe('030');
    });

    it('replaces a chosen priority with the STAT default, then returns to Regular', () => {
      choosePriority('010');
      changeTo('STAT');
      expect(form.value.Priority).toBe(statPriority);
      changeTo('Q12H');
      expect(form.value.Priority).toBe('010');
    });

    it('Additional Dose Now sets High and unticking returns to Regular', () => {
      changeTo('Q12H');
      setAdditionalDose(true);
      expect(form.value.Priority).toBe('020');
      setAdditionalDose(false);
      expect(form.value.Priority).toBe('010');
    });

    it('Additional Dose Now never lowers the STAT priority', () => {
      changeTo('STAT');
      setAdditionalDose(true);
      expect(form.value.Priority).toBe(statPriority);
      setAdditionalDose(false);
      expect(form.value.Priority).toBe(statPriority);
    });

    it('keeps High while Additional Dose Now stays ticked across frequency changes', () => {
      changeTo('STAT');
      setAdditionalDose(true);
      changeTo('DAILY');
      expect(form.value.Priority).toBe('020');
    });
  });

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

  it('submits preserved values for an edited order after confirmation', async () => {
    spyOn(swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    edit.editprofileForm.patchValue({ N1znr: 'DEFTIM' });
    changeEditFrequency('DEFTIM');
    await edit.onEditAction();
    const order = prescriptionService.postData.calls.mostRecent().args[1];
    expect(order.Pdur).toBe('2');
    expect(order.Pduru).toBe('TAG');
    expect(order.EndD).toBe('2030-01-03T08:00:00');
    expect(order.EndT).toBe('PT08H00M00S');
  });

  describe('edit validity reminder', () => {
    let warning: jasmine.Spy;

    beforeEach(() => {
      warning = spyOn(swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));
      prescriptionService.loadData.calls.reset();
    });

    it('shows the saved order validity and sends no requests when No is chosen', async () => {
      const before = edit.editprofileForm.value;
      await edit.onEditAction();
      expect(warning).toHaveBeenCalledTimes(1);
      const options = warning.calls.mostRecent().args[0];
      expect(options.icon).toBe('warning');
      expect(options.text).toContain('Test medication');
      expect(options.text).toContain('2 Days');
      expect(options.text).toContain('03.01.2030 08:00:00');
      expect(options.confirmButtonText).toBe('Yes');
      expect(options.cancelButtonText).toBe('No');
      expect(prescriptionService.loadData).not.toHaveBeenCalled();
      expect(prescriptionService.postData).not.toHaveBeenCalled();
      expect(edit.editprofileForm.value).toEqual(before);
    });

    it('sends no requests when the warning is dismissed', async () => {
      warning.and.returnValue(Promise.resolve({ isConfirmed: false, isDismissed: true } as any));
      await edit.onEditAction();
      expect(prescriptionService.loadData).not.toHaveBeenCalled();
      expect(prescriptionService.postData).not.toHaveBeenCalled();
    });

    it('sends the edit requests only after Yes and can retry after No', async () => {
      await edit.onEditAction();
      expect(prescriptionService.postData).not.toHaveBeenCalled();
      warning.and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      const pending = edit.onEditAction();
      expect(prescriptionService.loadData).not.toHaveBeenCalled();
      expect(prescriptionService.postData).not.toHaveBeenCalled();
      await pending;
      expect(prescriptionService.loadData).toHaveBeenCalledTimes(1);
      expect(prescriptionService.postData).toHaveBeenCalledTimes(1);
      expect(prescriptionService.postData.calls.mostRecent().args[0]).toBe('e-prescription/EditMedicationStatus');
    });

    it('prevents duplicate confirmation and requests while the warning is open', async () => {
      const pending = edit.onEditAction();
      edit.onEditAction();
      expect(warning).toHaveBeenCalledTimes(1);
      await pending;
      expect(prescriptionService.postData).not.toHaveBeenCalled();
    });

    for (const frequency of ['STAT', 'ONCE']) {
      it(`confirms ${frequency} automatic defaults even after earlier manual edits`, async () => {
        edit.editprofileForm.patchValue({ Pdur: '5', Pduru: 'TAG', EndD: new Date(2030, 0, 6, 8) });
        ['Pdur', 'Pduru', 'EndD'].forEach(name => edit.editprofileForm.get(name).markAsDirty());
        edit.editprofileForm.patchValue({ N1znr: frequency });
        changeEditFrequency(frequency);
        await edit.onEditAction();
        expect(warning.calls.mostRecent().args[0].text).toContain('1 Dose');
        expect(warning.calls.mostRecent().args[0].text).toContain('02.01.2030 08:00:00');
        expect(prescriptionService.postData).not.toHaveBeenCalled();
        warning.and.returnValue(Promise.resolve({ isConfirmed: true } as any));
        await edit.onEditAction();
        const order = prescriptionService.postData.calls.mostRecent().args[1];
        expect(order.Pdur).toBe('1');
        expect(order.Pduru).toBe('DOS');
        expect(order.EndD).toBe('2030-01-02T08:00:00');
      });
    }

    for (const values of [
      { Pdur: '3' }, { Pduru: 'STD' }, { EndD: new Date(2030, 0, 10, 8) },
      { Pdur: '' }, { Pdur: '0' }, { Pduru: null }, { EndD: null },
    ]) {
      it(`skips the reminder when validity is manually changed or incomplete: ${Object.keys(values)[0]}=${Object.values(values)[0]}`, () => {
        edit.editprofileForm.patchValue(values);
        Object.keys(values).forEach(name => edit.editprofileForm.get(name).markAsDirty());
        edit.onEditAction();
        expect(warning).not.toHaveBeenCalled();
        expect(prescriptionService.postData).toHaveBeenCalledTimes(1);
      });
    }

    it('keeps the reminder when only unrelated fields are edited', async () => {
      edit.editprofileForm.patchValue({ Quan: 2, Prn: true });
      edit.editprofileForm.get('Quan').markAsDirty();
      await edit.onEditAction();
      expect(warning).toHaveBeenCalledTimes(1);
      expect(prescriptionService.postData).not.toHaveBeenCalled();
    });

    it('preserves an incomplete saved validity through an ordinary cycle change', () => {
      edit.editdata = { ...edit.editdata, Pdur: '', Pduru: null, EndD: null, EndT: null };
      edit.ngOnInit();
      edit.editprofileForm.patchValue({ N1znr: 'DEFTIM' });
      changeEditFrequency('DEFTIM');
      edit.onEditAction();
      expect(warning).not.toHaveBeenCalled();
      expect(prescriptionService.postData.calls.mostRecent().args[1].EndD).toBeNull();
    });

    it('keeps the reminder and values after repeated ordinary cycle changes', async () => {
      for (const N1znr of ['DAILY', 'Q12H', 'DEFTIM', 'Q12H']) {
        edit.editprofileForm.patchValue({ N1znr });
        changeEditFrequency(N1znr);
      }
      expect(edit.editprofileForm.value.Pdur).toBe(2);
      expect(edit.editprofileForm.value.EndD).toEqual(endDate);
      await edit.onEditAction();
      expect(warning).toHaveBeenCalledTimes(1);
    });

    if (dashboard === 'Inpatient') {
      for (const [N1znr, N1id] of [['0000000003', 'DAILY'], ['0000000100', 'DEFTIM']]) {
        it(`does not recalculate saved Valid To when opening a ${N1id} order`, () => {
          edit.addministrationService.frequencyList.push({ CycleKey: N1znr, N1id });
          edit.editdata = { ...edit.editdata, N1znr, N1id, Dosdef: '1(08:00)', EndD: new Date(2030, 0, 10, 8) };
          edit.ngOnInit();
          expect(edit.editprofileForm.value.Pdur).toBe(2);
          expect(edit.editprofileForm.value.EndD).toEqual(new Date(2030, 0, 10, 8));
        });
      }
    }
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
