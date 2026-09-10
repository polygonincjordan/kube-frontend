import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { IcBundleAdultVentilatorComponent } from './ic-bundle-adult-ventilator.component';

// The component's constructor only needs a query-param stream, an action-type
// stream and the storage setters, so it is built directly rather than through
// TestBed. That keeps this spec about the scoring and validation rules.
function buildComponent(): IcBundleAdultVentilatorComponent {
  const route: any = { queryParams: of({ einri: '1000', patnr: '39', falnr: '13111', lfdnr: '00006' }) };
  const storage: any = {
    setEinri: () => {},
    setFalnr: () => {},
    setLfdnr: () => {},
    setPatnr: () => {},
    getUserProfile: () => ({ Gpart: '9000000050' })
  };
  const admission: any = { getAvapDetail: () => of(null), createAvapDoc: () => of({}) };
  const dataShare: any = { actionsType$: of(null), sendActionType: () => {} };
  const shared: any = { waringSwallModel: () => {}, successSwallModel: () => {} };

  const component = new IcBundleAdultVentilatorComponent(
    new FormBuilder(),
    route,
    storage,
    admission,
    dataShare,
    shared
  );
  component.ngOnInit();
  return component;
}

describe('IcBundleAdultVentilatorComponent', () => {
  let component: IcBundleAdultVentilatorComponent;

  beforeEach(() => {
    component = buildComponent();
  });

  describe('VAP prevention score', () => {
    it('starts at 5 because every bundle defaults to Not Applicable', () => {
      expect(component.avapForm.get('VapPreventionScore')?.value).toBe('5');
    });

    it('scores 5 when every bundle is Yes', () => {
      component.bundles.forEach((bundle) => component.setAnswer(bundle.field, component.YES));
      expect(component.avapForm.get('VapPreventionScore')?.value).toBe('5');
    });

    it('scores 0 when every bundle is No', () => {
      component.bundles.forEach((bundle) => component.setAnswer(bundle.field, component.NO));
      expect(component.avapForm.get('VapPreventionScore')?.value).toBe('0');
    });

    it('scores a mixed set by the rule: No is 0, Yes and N/A are 1', () => {
      component.setAnswer('Bundle1', component.NO);
      component.setAnswer('Bundle2', component.NO);
      component.setAnswer('Bundle3', component.NOT_APPLICABLE);
      component.setAnswer('Bundle4', component.NO);
      component.setAnswer('Bundle5', component.YES);
      expect(component.avapForm.get('VapPreventionScore')?.value).toBe('2');
    });

    it('counts an unrecognised answer as 0 rather than inflating compliance', () => {
      expect(component.scoreForAnswer('')).toBe(0);
      expect(component.scoreForAnswer('9')).toBe(0);
    });
  });

  describe('Not Applicable reason', () => {
    it('is required on the default answer, before the user touches anything', () => {
      expect(component.isNotApplicable('Bundle1')).toBeTrue();
      expect(component.avapForm.get('Bundle1NaReason')?.valid).toBeFalse();
    });

    it('is satisfied once a reason is written', () => {
      component.avapForm.get('Bundle1NaReason')?.setValue('Contraindicated');
      expect(component.avapForm.get('Bundle1NaReason')?.valid).toBeTrue();
    });

    it('is cleared and no longer required when the answer moves to Yes', () => {
      component.avapForm.get('Bundle1NaReason')?.setValue('Contraindicated');
      component.setAnswer('Bundle1', component.YES);
      expect(component.avapForm.get('Bundle1NaReason')?.value).toBe('');
      expect(component.avapForm.get('Bundle1NaReason')?.valid).toBeTrue();
    });

    it('becomes required again when the answer returns to Not Applicable', () => {
      component.setAnswer('Bundle1', component.NO);
      component.setAnswer('Bundle1', component.NOT_APPLICABLE);
      expect(component.avapForm.get('Bundle1NaReason')?.valid).toBeFalse();
    });
  });

  describe('mandatory ventilation fields', () => {
    // The service rejects null, '' and omission for every one of these, so all
    // four are required in the form regardless of the looser business rule.
    const required = ['MechVentStartDate', 'MechVentStartTime', 'IntubationDate', 'VapBundleDate'];

    it('marks all four invalid while empty', () => {
      required.forEach((field) => expect(component.avapForm.get(field)?.valid).toBeFalse());
    });

    it('accepts them once filled', () => {
      component.avapForm.get('MechVentStartDate')?.setValue(new Date());
      component.avapForm.get('MechVentStartTime')?.setValue('08:30:00');
      component.avapForm.get('IntubationDate')?.setValue(new Date());
      component.avapForm.get('VapBundleDate')?.setValue(new Date());
      required.forEach((field) => expect(component.avapForm.get(field)?.valid).toBeTrue());
    });

    it('still refuses to send when only the start date and time are filled', async () => {
      const admission: any = (component as any).admissionService;
      spyOn(admission, 'createAvapDoc').and.callThrough();
      component.avapForm.get('MechVentStartDate')?.setValue(new Date());
      component.avapForm.get('MechVentStartTime')?.setValue('08:30:00');
      component.bundles.forEach((bundle) => component.setAnswer(bundle.field, component.YES));

      const result = await component.createDoc('1');

      expect(result).toBeFalse();
      expect(admission.createAvapDoc).not.toHaveBeenCalled();
    });
  });

  describe('SAP formats', () => {
    it('writes a date as /Date(<ms>)/ on the calendar day the user picked', () => {
      // Local midnight on 9 September 2026, whatever the machine's timezone.
      const picked = new Date(2026, 8, 9, 0, 0, 0);
      expect(component.dateToSapFormat(picked)).toBe('/Date(' + Date.UTC(2026, 8, 9) + ')/');
    });

    it('returns null for an empty or unparseable date', () => {
      expect(component.dateToSapFormat(null)).toBeNull();
      expect(component.dateToSapFormat('not a date')).toBeNull();
    });

    it('pads a single-digit hour so parseTime can read it back', () => {
      expect(component.convertTimeToDuration('8:30:00')).toBe('PT08H30M00S');
      expect(component.parseTime(component.convertTimeToDuration('8:30:00'))).toBe('08:30:00');
    });

    it('round-trips a time through both converters', () => {
      expect(component.parseTime(component.convertTimeToDuration('23:05:09'))).toBe('23:05:09');
    });
  });

  describe('save gate', () => {
    it('refuses to send while a required field is empty', async () => {
      const admission: any = (component as any).admissionService;
      spyOn(admission, 'createAvapDoc').and.callThrough();

      const result = await component.createDoc('1');

      expect(result).toBeFalse();
      expect(admission.createAvapDoc).not.toHaveBeenCalled();
    });

    it('sends once the required fields are filled', async () => {
      const admission: any = (component as any).admissionService;
      spyOn(admission, 'createAvapDoc').and.callThrough();

      component.avapForm.get('MechVentStartDate')?.setValue(new Date(2026, 8, 9));
      component.avapForm.get('MechVentStartTime')?.setValue('08:30:00');
      component.avapForm.get('IntubationDate')?.setValue(new Date(2026, 8, 9));
      component.avapForm.get('VapBundleDate')?.setValue(new Date(2026, 8, 9));
      component.bundles.forEach((bundle) => component.setAnswer(bundle.field, component.YES));

      const result = await component.createDoc('1');

      expect(result).toBeTrue();
      expect(admission.createAvapDoc).toHaveBeenCalled();
    });

    it('builds a create-draft payload the service accepts', async () => {
      const admission: any = (component as any).admissionService;
      const spy = spyOn(admission, 'createAvapDoc').and.callThrough();

      component.avapForm.get('MechVentStartDate')?.setValue(new Date(2026, 8, 9));
      component.avapForm.get('MechVentStartTime')?.setValue('8:30:00');
      component.avapForm.get('IntubationDate')?.setValue(new Date(2026, 8, 9));
      component.avapForm.get('VapBundleDate')?.setValue(new Date(2026, 8, 9));
      component.setAnswer('Bundle1', component.YES);
      component.setAnswer('Bundle2', component.NO);
      component.setAnswer('Bundle3', component.NOT_APPLICABLE);
      component.avapForm.get('Bundle3NaReason')?.setValue('Contraindicated');
      component.setAnswer('Bundle4', component.YES);
      component.setAnswer('Bundle5', component.YES);

      await component.createDoc('1');
      const payload = spy.calls.mostRecent().args[0] as any;

      expect(payload.Dockey).toBe('');
      expect(payload.Dtid).toBe('ZMED_AVAP');
      expect(payload.DocStatus).toBe('1');
      expect(payload.Orgdo).toBe('F21IUAMC');
      expect(payload.AttendPhy).toBe('9000000050');
      expect(payload.Einri).toBe('1000');
      expect(payload.MechVentStartDate).toBe('/Date(' + Date.UTC(2026, 8, 9) + ')/');
      expect(payload.MechVentStartTime).toBe('PT08H30M00S');
      expect(payload.Bundle1).toBe('0');
      expect(payload.Bundle2).toBe('1');
      expect(payload.Bundle3).toBe('2');
      expect(payload.Bundle3NaReason).toBe('Contraindicated');
      expect(payload.VapPreventionScore).toBe('4');
    });

    it('carries the existing Dockey when updating rather than creating', async () => {
      const admission: any = (component as any).admissionService;
      const spy = spyOn(admission, 'createAvapDoc').and.callThrough();
      component.docKey = 'MED000000000000001000003602200000';

      component.avapForm.get('MechVentStartDate')?.setValue(new Date(2026, 8, 9));
      component.avapForm.get('MechVentStartTime')?.setValue('08:30:00');
      component.avapForm.get('IntubationDate')?.setValue(new Date(2026, 8, 9));
      component.avapForm.get('VapBundleDate')?.setValue(new Date(2026, 8, 9));
      component.bundles.forEach((bundle) => component.setAnswer(bundle.field, component.YES));

      await component.createDoc('1', 'edit');

      expect((spy.calls.mostRecent().args[0] as any).Dockey)
        .toBe('MED000000000000001000003602200000');
    });
  });

  describe('stored documents', () => {
    it('normalises an empty stored bundle value to Not Applicable', () => {
      component.initForm({ Bundle1: '', Bundle1NaReason: '' });
      expect(component.avapForm.get('Bundle1')?.value).toBe(component.NOT_APPLICABLE);
    });

    it('keeps a stored answer and its reason', () => {
      component.initForm({ Bundle3: '2', Bundle3NaReason: 'Contraindicated' });
      expect(component.avapForm.get('Bundle3')?.value).toBe('2');
      expect(component.avapForm.get('Bundle3NaReason')?.value).toBe('Contraindicated');
    });
  });
});
