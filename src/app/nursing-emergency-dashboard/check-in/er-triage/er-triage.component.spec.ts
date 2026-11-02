import { FormBuilder } from '@angular/forms';
import { fakeAsync, tick } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { ErTriageComponent } from './er-triage.component';
import { CheckInComponent } from '../check-in.component';

const ENCOUNTER = { Einri: 'TEST', Patnr: 'TEST-PATIENT', Falnr: 'TEST-CASE', Lfdbw: '1', ZeitIntern: 'PT10H00M00S' };
const PRIORITY = { Dockey: 'PRIORITY-KEY', Dokst: 'IA', Dokvr: '03', TriagePriorityCode: '02' };

describe('Emergency Triage Priority save', () => {
  let component: ErTriageComponent;
  let emergency: any;
  let shared: any;
  let hide: jasmine.Spy;
  let alert: jasmine.Spy;

  beforeEach(() => {
    emergency = jasmine.createSpyObj('EmergencyService', [
      'saveNurEmrTriage', 'saveTriage', 'triagePriorityList', 'getTriageDataIfStatusDraft',
    ]);
    emergency.saveNurEmrTriage.and.returnValue(of({ d: { Dockey: 'ADMISSION-KEY' } }));
    emergency.triagePriorityList.and.returnValue(of({ d: { results: [] } }));
    emergency.saveTriage.and.returnValue(of({ d: { ...PRIORITY } }));
    shared = jasmine.createSpyObj('SharedService', ['successSwallModel', 'waringSwallModel']);
    hide = jasmine.createSpy('hide');
    const storage: any = {
      einri: ENCOUNTER.Einri, patnr: ENCOUNTER.Patnr, falnr: ENCOUNTER.Falnr, lfdnr: '1',
      getGpart: () => 'TEST-USER', setEinri: () => {}, setPatnr: () => {},
      setFalnr: () => {}, setLfdnr: () => {},
    };
    component = new ErTriageComponent(
      { show: () => ({ hide }) } as any, {} as any, emergency, storage,
      {} as any, new FormBuilder(), shared, {} as any
    );
    spyOn(component, 'getDataPatient');
    spyOn(component, 'getSocialHistoryHabitList');
    alert = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    component.openModalForMain(ENCOUNTER);
    component.triageForm.patchValue({ TriagePriority: '04' });
  });

  function expectPartialSave() {
    expect(shared.successSwallModel).not.toHaveBeenCalled();
    expect(hide).not.toHaveBeenCalled();
    expect(shared.waringSwallModel).toHaveBeenCalledWith(
      jasmine.stringMatching(/^ER Admission saved, but Triage Priority was not saved\./)
    );
    expect(component.isSaving).toBe(false);
  }

  it('creates Priority with empty keys only after a successful empty lookup', () => {
    component.saveTraige();
    expect(emergency.triagePriorityList).toHaveBeenCalledWith({ patnr: ENCOUNTER.Patnr, falnr: ENCOUNTER.Falnr });
    expect(emergency.saveTriage).toHaveBeenCalledWith(jasmine.objectContaining({
      Dockey: '', Dokst: '', Dokvr: '', Dtid: 'ZMED_TRPRI', TriagePriorityCode: '04',
    }));
    expect(component.triageForm.value.Dockey).toBe('ADMISSION-KEY');
    expect(shared.successSwallModel).toHaveBeenCalledTimes(1);
    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('saves only admission when the fresh lookup finds the same existing Priority', () => {
    component.selectedTriageDetails = { ...PRIORITY, Dockey: 'STALE-KEY', Dokvr: '00' };
    component.triageForm.patchValue({ Dockey: 'ASSESSMENT-KEY', TriagePriority: '02' });
    component.Zversion = '99';
    emergency.triagePriorityList.and.returnValue(of({ d: { results: [PRIORITY] } }));
    component.saveTraige();
    expect(emergency.saveNurEmrTriage).toHaveBeenCalledTimes(1);
    expect(emergency.saveTriage).not.toHaveBeenCalled();
    expect(component.selectedTriageDetails).toEqual(PRIORITY);
    expect(component.triageForm.value.TriagePriority).toBe('02');
    expect(shared.successSwallModel).toHaveBeenCalledTimes(1);
    expect(shared.waringSwallModel).not.toHaveBeenCalled();
    expect(hide).toHaveBeenCalledTimes(1);
    expect(component.isSaving).toBe(false);
  });

  it('does not report success for an existing Priority without a valid code', () => {
    component.triageForm.patchValue({ TriagePriority: '' });
    emergency.triagePriorityList.and.returnValue(of({ d: { results: [{ ...PRIORITY, TriagePriorityCode: '' }] } }));
    component.saveTraige();
    expect(emergency.saveTriage).not.toHaveBeenCalled();
    expectPartialSave();
  });

  it('waits for admission, lookup and a nonempty Priority response before closing', () => {
    const admission = new Subject<any>();
    const lookup = new Subject<any>();
    const priority = new Subject<any>();
    emergency.saveNurEmrTriage.and.returnValue(admission);
    emergency.triagePriorityList.and.returnValue(lookup);
    emergency.saveTriage.and.returnValue(priority);
    component.saveTraige();
    expect(emergency.triagePriorityList).not.toHaveBeenCalled();
    admission.next({ d: { Dockey: 'ADMISSION-KEY' } });
    expect(emergency.saveTriage).not.toHaveBeenCalled();
    lookup.next({ d: { results: [] } });
    expect(shared.successSwallModel).not.toHaveBeenCalled();
    expect(hide).not.toHaveBeenCalled();
    priority.next({ d: PRIORITY });
    expect(hide).toHaveBeenCalledTimes(1);
    expect(component.isSaving).toBe(false);
  });

  it('does not send Priority when admission fails and permits retry', () => {
    emergency.saveNurEmrTriage.and.returnValue(throwError(() => ({ error: { error: { message: { value: 'Save failed' } } } })));
    component.saveTraige();
    expect(emergency.saveTriage).not.toHaveBeenCalled();
    expect(emergency.triagePriorityList).not.toHaveBeenCalled();
    expect(shared.successSwallModel).not.toHaveBeenCalled();
    expect(shared.waringSwallModel).toHaveBeenCalledWith('POST Error : Save failed');
    expect(hide).not.toHaveBeenCalled();
    expect(component.isSaving).toBe(false);
  });

  [undefined, { d: {} }, { d: { Dockey: '' } }, { d: { Dockey: '   ' } }].forEach(response => {
    it(`reports partial save for an empty Priority response ${JSON.stringify(response)}`, () => {
      emergency.saveTriage.and.returnValue(of(response));
      component.saveTraige();
      expectPartialSave();
    });
  });

  it('reports a failed Priority request without losing admission edits', () => {
    emergency.saveTriage.and.returnValue(throwError(() => new Error('Network error')));
    component.triageForm.patchValue({ ChiefComplaint: 'Synthetic test note' });
    component.scalesList = [{ ScaleType: 'Test scale', LastScore: '3', description: 'Test description', value: '1' }];
    component.saveTraige();
    expectPartialSave();
    expect(component.triageForm.value.ChiefComplaint).toBe('Synthetic test note');
    expect(component.triageForm.value.Dockey).toBe('ADMISSION-KEY');
    expect(component.scalesList[0].description).toBe('Test description');
    expect(component.scalesList[0].value).toBe('1');
    expect(emergency.saveNurEmrTriage.calls.mostRecent().args[0].TOSCALE)
      .toEqual([{ ScaleType: 'Test scale', LastScore: '3' }]);
  });

  it('reuses admission and discovers Priority created before a lost response on retry', () => {
    component.triageForm.patchValue({ TriagePriority: '02' });
    emergency.saveTriage.and.returnValue(throwError(() => new Error('Response lost')));
    emergency.triagePriorityList.and.returnValues(of({ d: { results: [] } }), of({ d: { results: [PRIORITY] } }));
    component.saveTraige();
    component.saveTraige();
    expect(emergency.saveNurEmrTriage.calls.argsFor(0)[0].Dockey).toBe('');
    expect(emergency.saveNurEmrTriage.calls.argsFor(1)[0].Dockey).toBe('ADMISSION-KEY');
    expect(emergency.saveTriage).toHaveBeenCalledTimes(1);
    expect(emergency.saveTriage.calls.argsFor(0)[0].Dockey).toBe('');
    expect(shared.successSwallModel).toHaveBeenCalledTimes(1);
  });

  it('saves admission but never creates Priority on lookup error, then retries the read', () => {
    component.triageForm.patchValue({ TriagePriority: '02' });
    emergency.triagePriorityList.and.returnValues(throwError(() => new Error('Read failed')), of({ d: { results: [PRIORITY] } }));
    component.saveTraige();
    expect(emergency.saveNurEmrTriage).toHaveBeenCalledTimes(1);
    expect(emergency.saveTriage).not.toHaveBeenCalled();
    expectPartialSave();
    component.saveTraige();
    expect(emergency.saveNurEmrTriage).toHaveBeenCalledTimes(2);
    expect(emergency.saveTriage).not.toHaveBeenCalled();
    expect(shared.successSwallModel).toHaveBeenCalledTimes(1);
  });

  it('does not overwrite a different Priority discovered after admission saves', () => {
    emergency.triagePriorityList.and.returnValue(of({ d: { results: [PRIORITY] } }));
    component.saveTraige();
    expect(emergency.saveNurEmrTriage.calls.argsFor(0)[0].TriagePriority).toBe('04');
    expect(emergency.saveTriage).not.toHaveBeenCalled();
    expect(component.triageForm.value.TriagePriority).toBe('02');
    expect(component.isTriagePrioritySelected).toBe(true);
    expectPartialSave();
    component.saveTraige();
    expect(emergency.saveNurEmrTriage.calls.argsFor(1)[0]).toEqual(jasmine.objectContaining({
      Dockey: 'ADMISSION-KEY', TriagePriority: '02',
    }));
    expect(emergency.saveTriage).not.toHaveBeenCalled();
    expect(shared.successSwallModel).toHaveBeenCalledTimes(1);
  });

  [null, {}, { d: { results: {} } }, { d: { results: [{}] } },
    { d: { results: [{ ...PRIORITY, Dokvr: undefined }] } },
    { d: { results: [PRIORITY, PRIORITY] } }].forEach(response => {
    it(`does not create Priority on an unverified lookup ${JSON.stringify(response)}`, () => {
      emergency.triagePriorityList.and.returnValue(of(response));
      component.saveTraige();
      expect(emergency.saveTriage).not.toHaveBeenCalled();
      expectPartialSave();
    });
  });

  it('keeps admission saving available when no Priority has been selected', () => {
    component.triageForm.patchValue({ TriagePriority: '' });
    component.saveTraige();
    expect(emergency.saveNurEmrTriage).toHaveBeenCalledTimes(1);
    expect(emergency.saveTriage).not.toHaveBeenCalled();
    expectPartialSave();
  });

  it('ignores a second Save while a save request is in flight', () => {
    const priority = new Subject<any>();
    emergency.saveTriage.and.returnValue(priority);
    component.saveTraige();
    component.saveTraige();
    expect(emergency.saveNurEmrTriage).toHaveBeenCalledTimes(1);
    expect(emergency.saveTriage).toHaveBeenCalledTimes(1);
  });

  it('allows Cancel after a partial save', fakeAsync(() => {
    emergency.saveTriage.and.returnValue(throwError(() => new Error('Save failed')));
    component.saveTraige();
    component.closeMainModel();
    tick();
    expect(hide).toHaveBeenCalledTimes(1);
  }));

  it('locks selection for a Priority document and resets it for the next form', () => {
    component.openModalForMain(ENCOUNTER, undefined, PRIORITY);
    expect(component.isTriagePrioritySelected).toBe(true);
    component.triageForm.patchValue({ TriagePriority: '05' });
    component.alreadySelected();
    expect(component.triageForm.value.TriagePriority).toBe('02');
    component.openModalForMain(ENCOUNTER);
    expect(component.isTriagePrioritySelected).toBe(false);
    component.triageForm.patchValue({ TriagePriority: '05' });
    component.alreadySelected();
    expect(component.triageForm.value.TriagePriority).toBe('05');
  });

  it('leaves selection unlocked when only the assessment contains Priority', () => {
    emergency.getTriageDataIfStatusDraft.and.returnValue(of({ d: { results: [{
      Dockey: 'ASSESSMENT-KEY', TriagePriority: '04', TOALLERGIES: { results: [] },
      TOVITALSIGNS: { results: [] }, TOSCALE: { results: [] },
    }] } }));
    component.openModalForMain(ENCOUNTER, { Dockey: 'ASSESSMENT-KEY', Zversion: '00' });
    expect(component.triageForm.value.TriagePriority).toBe('04');
    expect(component.triageForm.value.Dockey).toBe('ASSESSMENT-KEY');
    expect(component.isTriagePrioritySelected).toBe(false);
    component.triageForm.patchValue({ TriagePriority: '03' });
    component.alreadySelected();
    expect(component.triageForm.value.TriagePriority).toBe('03');
  });

  it('opens the admission form even if the initial Priority lookup fails', () => {
    const parent: any = Object.create(CheckInComponent.prototype);
    const open = jasmine.createSpy('openModalForMain');
    parent.triageModal = { openModalForMain: open };
    parent.emergencyService = {
      triagePriorityList: () => throwError(() => new Error('Read failed')),
      getTriageLatestDocumentSet: () => of({ d: { results: [{ StatusTxt: 'Draft' }] } }),
    };
    parent.openModalForTriage(null, ENCOUNTER);
    expect(open).toHaveBeenCalledWith(ENCOUNTER, { StatusTxt: 'Draft' }, undefined);
    expect(alert).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'warning' }));
  });
});

describe('Emergency Triage Released guard', () => {
  let parent: any;
  let open: jasmine.Spy;
  let pdfFormOpen: jasmine.Spy;
  let alert: jasmine.Spy;

  function openTriage(latestDocuments: any[]) {
    parent.emergencyService.getTriageLatestDocumentSet = () => of({ d: { results: latestDocuments } });
    parent.openModalForTriage(null, ENCOUNTER);
  }

  beforeEach(() => {
    parent = Object.create(CheckInComponent.prototype);
    open = jasmine.createSpy('openModalForMain');
    parent.triageModal = { openModalForMain: open };
    parent.emergencyService = {
      triagePriorityList: () => of({ d: { results: [PRIORITY] } }),
      getTriageReleasedPdfUrl: jasmine.createSpy('getTriageReleasedPdfUrl')
        .and.returnValue(of({ d: { AttachmentData: btoa('%PDF-test') } })),
    };
    pdfFormOpen = spyOn(parent, 'pdfFormOpen');
    alert = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
  });

  it('opens the PDF for a released triage and never the editable form', () => {
    const released = { StatusTxt: 'Released', Dockey: 'RELEASED-KEY' };
    openTriage([released]);
    expect(parent.emergencyService.getTriageReleasedPdfUrl).toHaveBeenCalledWith(released);
    expect(parent.pdfUrl).toEqual(jasmine.any(Blob));
    expect(pdfFormOpen).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
  });

  it('opens the editable form for a Draft triage', () => {
    const draft = { StatusTxt: 'Draft', Dockey: 'DRAFT-KEY' };
    openTriage([draft]);
    expect(open).toHaveBeenCalledWith(ENCOUNTER, draft, PRIORITY);
    expect(parent.emergencyService.getTriageReleasedPdfUrl).not.toHaveBeenCalled();
  });

  it('opens the editable form when no triage document exists', () => {
    openTriage([]);
    expect(open).toHaveBeenCalledWith(ENCOUNTER, '', PRIORITY);
    expect(parent.emergencyService.getTriageReleasedPdfUrl).not.toHaveBeenCalled();
  });

  it('warns when the released PDF cannot be opened', () => {
    parent.emergencyService.getTriageReleasedPdfUrl.and.returnValue(throwError(() => new Error('PDF failed')));
    openTriage([{ StatusTxt: 'Released', Dockey: 'RELEASED-KEY' }]);
    expect(alert).toHaveBeenCalledWith(jasmine.objectContaining({
      text: 'The triage document is released, but its PDF could not be opened.', icon: 'warning',
    }));
    expect(pdfFormOpen).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });
});
