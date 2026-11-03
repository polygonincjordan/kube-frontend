import { CommonModule, DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EMPTY, Subject } from 'rxjs';
import swal from 'sweetalert2';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { parseDosdef, timedScheduleErrors } from '../shared-module/timed-dose-schedule';
import { CreateAdministrationComponent } from './administration/create-administration/create-administration.component';
import { FrequencyDeftimComponent } from './administration/frequency-deftim/frequency-deftim.component';

const frequencies = [
  { CycleKey: '0000000002', N1id: 'Q12H', OptionField: 'Q12H' },
  { CycleKey: '0000000003', N1id: 'DAILY', OptionField: 'DAILY' },
  { CycleKey: '0000000100', N1id: 'DEFTIM', OptionField: 'Defined Timing' },
];
const unitList = [
  { Agentid: 'A1', Mseht: 'ML', Agent: '', Meinh: 'ML', Quant: '5.000', OptionField: 'ML' },
  { Agentid: 'A2', Mseht: 'MG', Agent: '', Meinh: 'MG', Quant: '250.000', OptionField: 'MG' },
];
const at = (hour: number) => new Date(2030, 0, 1, hour);

describe('Timed dose schedule rules', () => {
  it('reads every scheduled dose and drops the 08:00 entry that only fills the format', () => {
    expect(parseDosdef('150(08:00)-75(20:00)')).toEqual([{ dose: '150', time: '08:00' }, { dose: '75', time: '20:00' }]);
    expect(parseDosdef('0(08:00)-1.5(12:00)-2.75(20:00)')).toEqual([{ dose: '1.5', time: '12:00' }, { dose: '2.75', time: '20:00' }]);
    expect(parseDosdef('0(08:00)')).toEqual([{ dose: '0', time: '08:00' }]);
    expect(parseDosdef('')).toEqual([]);
  });

  it('names the missing dose, unit and time of each row and accepts a 0 dose', () => {
    expect(timedScheduleErrors([
      { deftimDose: 0, deftimDosageUnit: 'MG', deftimTime: at(8) },
      { deftimDose: null, deftimDosageUnit: '', deftimTime: at(20) },
      { deftimDose: '1.5', deftimDosageUnit: 'MG', deftimTime: null },
    ])).toEqual(['row 2 (20:00): Dose, Dosage Unit', 'row 3: Time']);
    expect(timedScheduleErrors([])).toEqual(['add at least one dose time']);
  });
});

describe('Inpatient create order: DEFTIM and DAILY timing table', () => {
  let fixture: ComponentFixture<CreateAdministrationComponent>;
  let component: CreateAdministrationComponent;
  let prescriptionService: any;
  let unitList$: Subject<any>;

  const row = () => component.drugArray.at(0) as FormGroup;
  const query = (selector: string) => fixture.nativeElement.querySelector(selector);
  const queryAll = (selector: string): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll(selector));
  const settle = () => { fixture.detectChanges(); tick(100); fixture.detectChanges(); };
  const panel = () => fixture.debugElement.query(By.directive(FrequencyDeftimComponent)).componentInstance as FrequencyDeftimComponent;
  const mainDose = (): HTMLInputElement => query('input[formControlName="Quan"]');
  const tableDoses = (): HTMLInputElement[] => queryAll('frequency-deftim input[formControlName="deftimDose"]') as HTMLInputElement[];
  const order = () => prescriptionService.postData.calls.mostRecent().args[1].TOSTD[0];
  const lastPopupText = () => (swal.fire as jasmine.Spy).calls.mostRecent().args[0].text;

  function type(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    settle();
  }

  function chooseFrequency(label: string) {
    query('ng-select[formControlName="N1znr"] .ng-select-container').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    settle();
    const option = Array.from(document.querySelectorAll('.ng-option'))
      .find((element: HTMLElement) => element.textContent.trim() === label) as HTMLElement;
    option.click();
    settle();
  }

  function addTime(hour: number) {
    (queryAll('frequency-deftim .bor-data')[0]).click();
    settle();
    panel().drugArray.at(panel().drugArray.length - 1).patchValue({ deftimTime: at(hour) });
    settle();
  }

  function render() {
    fixture = TestBed.createComponent(CreateAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    row().patchValue({
      Result_Drug_Name: 'Test medication', Phformid: 'TABLET', Routedescr: { Descr: 'ORAL', Aprouid: 'PO' },
      AgentidResult: unitList, Quanunit: unitList[1], Agentid: 'A2', StartD: new Date(2030, 0, 1, 8),
    });
    row().markAsTouched();
    settle();
  }

  beforeEach(async () => {
    // CSS animation-end events are not advanced by fakeAsync's clock.
    const fire = swal.fire.bind(swal);
    spyOn(swal, 'fire').and.callFake((options: any) => fire({
      ...options, showClass: { popup: '' }, hideClass: { popup: '' },
    }));
    prescriptionService = {
      parameters: {}, loadParameters: () => ({}),
      loadData: jasmine.createSpy('loadData').and.callFake((url: string) =>
        typeof url === 'string' && url.startsWith('e-prescription/DurgUnitlist') ? unitList$ : EMPTY),
      postData: jasmine.createSpy('postData').and.returnValue(EMPTY),
    };
    unitList$ = new Subject();
    await TestBed.configureTestingModule({
      declarations: [CreateAdministrationComponent, FrequencyDeftimComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule,
        BsDatepickerModule.forRoot(), NoopAnimationsModule, NgbCollapseModule],
      providers: [
        DatePipe,
        { provide: ActivatedRoute, useValue: {} },
        { provide: NgbModal, useValue: {} },
        { provide: EPrescriptionService, useValue: prescriptionService },
        { provide: AddministrationService, useValue: {
          frequencyList: frequencies,
          durationUnitList: [{ Unit: 'TAG', Text: 'Days' }],
          routeDropdownList: [], medicationDrugList: [], physicianList: [],
          medicationAdministrative: { EmpResp: 'P1', OrderingDept: 'D1', OrderingTo: 'W1' },
          loadDropdownList: () => {},
        } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  afterEach(() => {
    swal.close();
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  for (const frequency of ['Defined Timing', 'DAILY']) {
    describe(frequency, () => {
      it('moves a dose entered first into the first time and makes the main Dosage read-only', fakeAsync(() => {
        render();
        expect(mainDose().readOnly).toBe(false);
        type(mainDose(), '150');
        chooseFrequency(frequency);

        expect(tableDoses().map(d => d.value)).toEqual(['150']);
        expect(mainDose().readOnly).toBe(true);
        expect(mainDose().value).toBe('150');
        expect(query('.timed-dose-hint').textContent).toContain('First dose (08:00)');
        expect(query('.timed-dose-hint').textContent).toContain('Edit doses in the timing table');
        expect(row().value.Dosdef).toBe('150(08:00)');
        flush();
      }));

      it('starts the first time empty when no dose was entered, then takes the dose from the table', fakeAsync(() => {
        render();
        chooseFrequency(frequency);
        expect(tableDoses().map(d => d.value)).toEqual(['']);
        expect(mainDose().value).toBe('');

        type(tableDoses()[0], '150');
        expect(row().value.Quan).toBe(150);
        expect(mainDose().value).toBe('150');
        expect(row().value.Dosdef).toBe('150(08:00)');
        flush();
      }));

      it('sends a different dose per time, with fractions, exactly as entered', fakeAsync(() => {
        render();
        chooseFrequency(frequency);
        type(tableDoses()[0], '1.5');
        addTime(20);
        expect(tableDoses()[1].value).toBe('');
        type(tableDoses()[1], '2.75');

        expect(mainDose().value).toBe('1.5');
        component.onSubmitData();
        expect(order().Quan).toBe('1.5');
        expect(order().Dosdef).toBe('1.5(08:00)-2.75(20:00)');
        expect(order().Quanunit).toBe('MG');
        flush();
      }));

      it('blocks the order and names the incomplete time', fakeAsync(() => {
        render();
        chooseFrequency(frequency);
        type(tableDoses()[0], '150');
        addTime(20);
        component.onSubmitData();
        settle();

        expect(prescriptionService.postData).not.toHaveBeenCalled();
        expect(lastPopupText()).toBe('Missing Test medication: row 2 (20:00): Dose');
        expect(row().value.Dosdef).toBe('150(08:00)-(20:00)');
        expect(row().value.Quan).toBe(150);
        swal.close();
        flush();

        panel().drugArray.at(1).patchValue({ deftimDosageUnit: null, deftimTime: null });
        settle();
        component.onSubmitData();
        settle();
        expect(prescriptionService.postData).not.toHaveBeenCalled();
        expect(lastPopupText()).toBe('Missing Test medication: row 2: Dose, Dosage Unit, Time');
        flush();
      }));

      it('blocks the order when the only time has no dose, without turning it into 0', fakeAsync(() => {
        render();
        chooseFrequency(frequency);
        component.onSubmitData();
        settle();
        expect(prescriptionService.postData).not.toHaveBeenCalled();
        expect(row().value.Quan).toBe('');
        expect(lastPopupText()).toBe('Missing Test medication: row 1 (08:00): Dose');
        flush();
      }));

      it('removes a deleted time from the order', fakeAsync(() => {
        render();
        chooseFrequency(frequency);
        type(tableDoses()[0], '150');
        addTime(20);
        type(tableDoses()[1], '75');
        (queryAll('frequency-deftim img.iconsminds-cursor-click')[0]).click();
        settle();
        (document.querySelector('.swal2-confirm') as HTMLElement).click();
        settle();
        flush();
        settle();

        expect(tableDoses().map(d => d.value)).toEqual(['75']);
        expect(row().value.Quan).toBe(75);
        expect(row().value.Dosdef).toBe('0(08:00)-75(20:00)');
        flush();
      }));

      it('starts the timing table over when the medicine changes while it is open', fakeAsync(() => {
        render();
        chooseFrequency(frequency);
        type(tableDoses()[0], '150');
        addTime(20);
        type(tableDoses()[1], '75');

        component.onSelectMedicine({ data: { Agentid: 'B1', Drugid: 'DB', Drugname: 'Medicine B', Formatdescr: 'Tablet' }, index: 0 });
        settle();
        expect(query('frequency-deftim')).toBeNull();
        expect(row().value.Quan).toBe('');
        unitList$.next({ body: { d: { results: [{ Agentid: 'B1', Mseht: 'ML', Agent: '', Meinh: 'ML', Quant: '10.000' }] } } });
        settle();

        expect(tableDoses().map(d => d.value)).toEqual(['']);
        expect(row().value.deftimcycleData[0].deftimDosageUnit).toBe('ML');
        expect(row().value.Dosdef).toBe('(08:00)');
        expect(mainDose().value).toBe('');
        expect(mainDose().readOnly).toBe(true);
        // Editing the new table no longer brings the previous medicine's dose back.
        type(tableDoses()[0], '');
        expect(row().value.Quan).toBe('');
        component.onSubmitData();
        settle();
        expect(prescriptionService.postData).not.toHaveBeenCalled();
        expect(lastPopupText()).toBe('Missing Test medication: row 1 (08:00): Dose');
        flush();
      }));

      it('returns the main Dosage to input on a regular frequency and restores the times when coming back', fakeAsync(() => {
        render();
        chooseFrequency(frequency);
        type(tableDoses()[0], '150');
        addTime(20);
        type(tableDoses()[1], '75');

        chooseFrequency('Q12H');
        expect(query('frequency-deftim')).toBeNull();
        expect(mainDose().readOnly).toBe(false);
        expect(mainDose().value).toBe('150');
        expect(query('.timed-dose-hint')).toBeNull();
        component.onSubmitData();
        expect(order().Dosdef).toBe('');
        expect(order().Quan).toBe('150');
        prescriptionService.postData.calls.reset();

        chooseFrequency(frequency);
        expect(tableDoses().map(d => d.value)).toEqual(['150', '75']);
        expect(mainDose().value).toBe('150');
        expect(mainDose().readOnly).toBe(true);
        component.onSubmitData();
        expect(order().Dosdef).toBe('150(08:00)-75(20:00)');
        flush();
      }));
    });
  }

  it('keeps a saved schedule and its fractions when a template is loaded', fakeAsync(() => {
    render();
    component.drugArray.clear();
    component.processTemplateData([{
      Agentid: 'A2', Drugid: 'D1', N1znr: '0000000100', Result_Drug_Name: 'Test medication', Quan: '1.000', Quanunit: 'MG',
      Formatdescr: '', Routedescr: 'ORAL', Pdur: '2', Pduru: 'TAG', Aprouteid: 'PO', Phformid: 'TABLET',
      Prncond: '', Prn: false, Descr: '', Complex: '', Dosdef: '0(08:00)-1.5(12:00)-2.75(20:00)', N1ztxt: '', TOCOMPLEX: [], TOCYCDEF: [],
    }] as any);
    settle();

    expect(tableDoses().map(d => d.value)).toEqual(['1.5', '2.75']);
    expect(row().value.Quan).toBe('1.5');
    expect(row().value.Dosdef).toBe('0(08:00)-1.5(12:00)-2.75(20:00)');
    expect(mainDose().readOnly).toBe(true);
    flush();
  }));
});
