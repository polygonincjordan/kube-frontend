import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { ProgressNotesComponent } from './progress-notes.component';

describe('ProgressNotesComponent', () => {
  let component: ProgressNotesComponent;
  let dataServices: jasmine.SpyObj<any>;

  beforeEach(() => {
    const admissionService = {
      getCategorySetData: jasmine.createSpy(),
      categorySetData$: of([]),
      getNotesTemplateSetData: jasmine.createSpy(),
      progressNoteTempSetData$: of([]),
    };
    const route = {
      queryParams: of({ patnr: 'PATIENT', falnr: 'CASE' }),
    };
    const emergencyService = jasmine.createSpyObj('EmergencyService', [
      'successSwalModel',
      'errorSwalModel',
    ]);
    const storageService = {
      patientData: { deptOrgUnit: 'UNIT' },
      getUserProfile: () => ({ ProfGroup: 'PHY', Gpart: 'PHYSICIAN' }),
    };
    dataServices = jasmine.createSpyObj('EEmrService', [
      'createProgressEntry',
      'replaceProgressEntry',
    ]);

    component = new ProgressNotesComponent(
      new FormBuilder(),
      admissionService as any,
      route as any,
      {} as any,
      dataServices,
      emergencyService,
      storageService as any
    );
    spyOn(component, 'getProgressNotesData');
    spyOn(component.dataToParents, 'emit');
    component.ngOnInit();
  });

  it('marks entered note text as unsaved', () => {
    component.progressNoteForm.controls.Text.setValue('New progress note');

    expect(component.unsavedProgressNote).toBeTrue();
    expect(component.dataToParents.emit).toHaveBeenCalledWith(true);
  });

  it('clears and emits the unsaved state after creating a note', () => {
    dataServices.createProgressEntry.and.returnValue(of({ saved: true }));
    component.progressNoteForm.controls.Text.setValue('New progress note');
    (component.dataToParents.emit as jasmine.Spy).calls.reset();

    component.createProgressNote();

    expect(component.unsavedProgressNote).toBeFalse();
    expect(component.dataToParents.emit).toHaveBeenCalledWith(false);
  });

  it('clears and emits the unsaved state after replacing a note', () => {
    dataServices.replaceProgressEntry.and.returnValue(of({ saved: true }));
    component.actionType = 'replace';
    component.selectedProgressNote = {};
    component.progressNoteForm.controls.Text.setValue('Replacement note');
    (component.dataToParents.emit as jasmine.Spy).calls.reset();

    component.createProgressNote();

    expect(component.unsavedProgressNote).toBeFalse();
    expect(component.dataToParents.emit).toHaveBeenCalledWith(false);
  });
});
