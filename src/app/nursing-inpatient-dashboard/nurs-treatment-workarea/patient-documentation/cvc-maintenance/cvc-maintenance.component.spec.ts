import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { CvcMaintenanceComponent } from './cvc-maintenance.component';

// The component's constructor only needs a query-param stream, an action-type
// stream and the storage setters, so it is built directly rather than through
// TestBed. That keeps this spec about the answer defaults, the required times
// and the question 2 derivation.
function buildComponent(): CvcMaintenanceComponent {
  const route: any = { queryParams: of({ einri: '1000', patnr: '39', falnr: '13111', lfdnr: '00006' }) };
  const storage: any = {
    setEinri: () => {},
    setFalnr: () => {},
    setLfdnr: () => {},
    setPatnr: () => {},
    getUserProfile: () => ({ Gpart: '9000000050' })
  };
  const admission: any = { getCvcMainDetail: () => of(null), createCvcMainDoc: () => of({}) };
  const dataShare: any = { actionsType$: of(null), sendActionType: () => {} };
  const shared: any = { waringSwallModel: () => {}, successSwallModel: () => {} };

  // Argument order follows this component's constructor: sharedService comes
  // before dataShareService, unlike the A-VAP component.
  const component = new CvcMaintenanceComponent(
    new FormBuilder(),
    route,
    storage,
    admission,
    shared,
    dataShare
  );
  component.ngOnInit();
  return component;
}

describe('CvcMaintenanceComponent', () => {
  let component: CvcMaintenanceComponent;

  const answerFields = ['Cvc1', 'Cvc2', 'Cvc21', 'Cvc22', 'Cvc23', 'Cvc24', 'Cvc3'];
  const ivSetFields = ['Cvc21', 'Cvc22', 'Cvc23', 'Cvc24'];

  // The derived control is disabled, so its value is read raw.
  function derived(): string {
    return component.cvcMainForm.getRawValue().Cvc2;
  }

  function answerIvSets(values: string[]): void {
    ivSetFields.forEach((field, index) => component.cvcMainForm.get(field).setValue(values[index]));
  }

  function fillRequiredTimes(): void {
    component.cvcMainForm.get('CvcInsertionTime').setValue('05:00:00');
    component.cvcMainForm.get('MaintenanceTime').setValue('10:00:00');
  }

  beforeEach(() => {
    component = buildComponent();
  });

  describe('answer defaults', () => {
    it('opens every question on No', () => {
      answerFields.forEach((field) =>
        expect(component.cvcMainForm.getRawValue()[field]).toBe(component.NO)
      );
    });

    it('keeps a stored answer instead of overwriting it with the default', () => {
      component.initForm({ Cvc1: component.YES, Cvc3: component.NOT_DOCUMENTED });
      expect(component.cvcMainForm.get('Cvc1').value).toBe(component.YES);
      expect(component.cvcMainForm.get('Cvc3').value).toBe(component.NOT_DOCUMENTED);
    });

    it('normalises an empty stored answer to No, so a reopened document reads like a new one', () => {
      component.initForm({ Cvc1: '', Cvc21: null });
      expect(component.cvcMainForm.get('Cvc1').value).toBe(component.NO);
      expect(component.cvcMainForm.get('Cvc21').value).toBe(component.NO);
    });
  });

  describe('mandatory times', () => {
    it('marks both time fields invalid while empty', () => {
      expect(component.cvcMainForm.get('CvcInsertionTime').valid).toBeFalse();
      expect(component.cvcMainForm.get('MaintenanceTime').valid).toBeFalse();
    });

    it('accepts them once filled', () => {
      fillRequiredTimes();
      expect(component.cvcMainForm.get('CvcInsertionTime').valid).toBeTrue();
      expect(component.cvcMainForm.get('MaintenanceTime').valid).toBeTrue();
    });

    it('hides the error until the field is touched or a save is attempted', () => {
      expect(component.showError('CvcInsertionTime')).toBeFalse();
      component.cvcMainForm.get('CvcInsertionTime').markAsTouched();
      expect(component.showError('CvcInsertionTime')).toBeTrue();
    });
  });

  describe('save gate', () => {
    it('refuses to send while a required time is empty', async () => {
      const admission: any = (component as any).admissionService;
      spyOn(admission, 'createCvcMainDoc').and.callThrough();

      const result = await component.createDoc('1');

      expect(result).toBeFalse();
      expect(admission.createCvcMainDoc).not.toHaveBeenCalled();
    });

    it('flags both time fields after a refused save', async () => {
      await component.createDoc('1');
      expect(component.showError('CvcInsertionTime')).toBeTrue();
      expect(component.showError('MaintenanceTime')).toBeTrue();
    });

    it('sends once both times are filled', async () => {
      const admission: any = (component as any).admissionService;
      spyOn(admission, 'createCvcMainDoc').and.callThrough();
      fillRequiredTimes();

      const result = await component.createDoc('1');

      expect(result).toBeTrue();
      expect(admission.createCvcMainDoc).toHaveBeenCalled();
    });

    // A disabled control is dropped from form.value, so the payload is built
    // from getRawValue. Without it the derived answer never reaches SAP.
    it('carries the derived question 2 in the payload', async () => {
      const admission: any = (component as any).admissionService;
      spyOn(admission, 'createCvcMainDoc').and.callThrough();
      fillRequiredTimes();
      answerIvSets([component.YES, component.YES, component.YES, component.YES]);

      await component.createDoc('1');

      const payload = admission.createCvcMainDoc.calls.mostRecent().args[0];
      expect(payload.Cvc2).toBe(component.YES);
    });
  });

  describe('question 2 is derived from 2.1 - 2.4', () => {
    it('is locked against the user', () => {
      expect(component.cvcMainForm.get('Cvc2').disabled).toBeTrue();
    });

    it('is No on a new document, because every answer defaults to No', () => {
      expect(derived()).toBe(component.NO);
    });

    it('is Yes when all four are Yes', () => {
      answerIvSets([component.YES, component.YES, component.YES, component.YES]);
      expect(derived()).toBe(component.YES);
    });

    it('is Yes when at least one is Yes and the rest are Not Applicable', () => {
      answerIvSets([
        component.YES,
        component.NOT_APPLICABLE,
        component.NOT_APPLICABLE,
        component.NOT_APPLICABLE
      ]);
      expect(derived()).toBe(component.YES);
    });

    it('is Not Applicable when all four are Not Applicable', () => {
      answerIvSets([
        component.NOT_APPLICABLE,
        component.NOT_APPLICABLE,
        component.NOT_APPLICABLE,
        component.NOT_APPLICABLE
      ]);
      expect(derived()).toBe(component.NOT_APPLICABLE);
    });

    it('is No when any one is No, whatever the others say', () => {
      answerIvSets([component.YES, component.YES, component.NO, component.NOT_APPLICABLE]);
      expect(derived()).toBe(component.NO);
    });

    it('is No when any one is Not Documented, whatever the others say', () => {
      answerIvSets([
        component.YES,
        component.NOT_APPLICABLE,
        component.YES,
        component.NOT_DOCUMENTED
      ]);
      expect(derived()).toBe(component.NO);
    });

    it('follows every later change to 2.1 - 2.4', () => {
      answerIvSets([component.YES, component.YES, component.YES, component.YES]);
      expect(derived()).toBe(component.YES);

      component.cvcMainForm.get('Cvc23').setValue(component.NOT_DOCUMENTED);
      expect(derived()).toBe(component.NO);

      component.cvcMainForm.get('Cvc23').setValue(component.NOT_APPLICABLE);
      expect(derived()).toBe(component.YES);
    });

    // A document stored before this rule existed can hold a Cvc2 that no longer
    // agrees with its own 2.1 - 2.4, and the derivation wins on reopen.
    it('recomputes a stored value that disagrees with 2.1 - 2.4', () => {
      component.initForm({
        Cvc2: component.YES,
        Cvc21: component.YES,
        Cvc22: component.NO,
        Cvc23: component.YES,
        Cvc24: component.YES
      });
      expect(derived()).toBe(component.NO);
    });
  });
});
