import { CommonModule, DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EMPTY, Subject, of } from 'rxjs';
import swal from 'sweetalert2';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { CreateAdministrationComponent } from './administration/create-administration/create-administration.component';

// Units returned by DurgUnitlist; each carries an SAP default quantity that must not replace the dose.
const units = () => [
  { Agentid: 'A1', Mseht: 'ML', Agent: '', Meinh: 'ML', Quant: '5.000' },
  { Agentid: 'A2', Mseht: 'MG', Agent: 'Base', Meinh: 'MG', Quant: '250.000' },
];
const drugPropResponse = {
  body: { d: { results: [{
    NAVDRUGFORMATROUTEUNITS: { results: [] },
    NAVDRUGFORMATROUTES: { results: [{ FormID: 'TABLET' }] },
  }] } },
};
const medicine = { Agentid: 'A1', Drugid: 'D1', Drugname: 'Test medication', Formatdescr: 'Tablet' };

describe('Inpatient create order: dose and dosage unit', () => {
  let create: CreateAdministrationComponent;
  let prescriptionService: any;
  let unitList$: Subject<any>;

  const row = (index = 0) => create.drugArray.at(index) as FormGroup;
  const enterDose = (value: any, index = 0) => {
    row(index).patchValue({ Quan: value });
    row(index).get('Quan').markAsDirty();
    row(index).markAsTouched();
  };
  const changeUnit = (unit: any, index = 0) => {
    row(index).patchValue({ Quanunit: unit });
    create.onChangeDosageUnit(row(index).value.AgentidResult, unit, index);
  };
  const selectMedicine = (index = 0) => {
    create.onSelectMedicine({ data: medicine, index });
    unitList$.next({ body: { d: { results: units() } } });
  };
  const completeRow = (index = 0) => {
    row(index).patchValue({
      Result_Drug_Name: 'Test medication', Phformid: 'TABLET', Routedescr: { Descr: 'ORAL', Aprouid: 'PO' },
      Quanunit: units()[1], N1znr: 'Q12H', StartD: new Date(2030, 0, 1, 8), Complex: '',
    });
    row(index).markAsTouched();
  };

  beforeEach(() => {
    spyOn(swal, 'fire').and.returnValue(Promise.resolve({ value: false }) as any);
    unitList$ = new Subject();
    prescriptionService = {
      parameters: { einri: 'E1', falnr: 'C1', lfdnr: '1' }, loadParameters: () => ({}),
      loadData: jasmine.createSpy('loadData').and.callFake((url: string) => {
        if (url === 'DrugPropSet') { return of(drugPropResponse); }
        if (url.startsWith('e-prescription/DurgUnitlist')) { return unitList$; }
        if (url.startsWith('e-prescription/frequencyQ24Cycle')) {
          return of({ body: { d: { results: [{ N1begzt: 'PT08H00M00S' }] } } });
        }
        return EMPTY;
      }),
      postData: jasmine.createSpy('postData').and.returnValue(EMPTY),
    };
    const administrationService: any = {
      frequencyList: ['Q12H', 'Q24H', 'DEFTIM'].map(N1id => ({ CycleKey: N1id, N1id })),
      medicationAdministrative: { EmpResp: 'P1', OrderingDept: 'D1', OrderingTo: 'W1' },
      durationUnitList: [{ Unit: 'TAG', Text: 'Days' }],
    };
    create = new CreateAdministrationComponent(null, prescriptionService, null, administrationService, null);
    create.administrationForm = new FormGroup({ AdministrationData: new FormArray([]) });
    create.drugArray.push(create.generateForm());
  });

  it('starts a new row with an empty, required dose', () => {
    expect(row().value.Quan).toBe('');
    expect(row().get('Quan').errors).toEqual({ required: true });
  });

  it('does not fill the dose from the unit default when a medicine is selected', () => {
    selectMedicine();
    expect(row().value.Quan).toBe('');
    expect(row().value.Quanunit).toEqual(jasmine.objectContaining({ Agentid: 'A1', Quant: '5.000' }));
    expect(row().value.Agentid).toBe('A1');
    expect(row().value.AgentidResult.length).toBe(2);
  });

  it('keeps a dose typed while the unit list is still loading', () => {
    create.onSelectMedicine({ data: medicine, index: 0 });
    enterDose('150');
    unitList$.next({ body: { d: { results: units() } } });
    expect(row().value.Quan).toBe('150');
  });

  it('clears the previous medicine dose when another medicine is selected', () => {
    selectMedicine();
    enterDose('150');
    selectMedicine();
    expect(row().value.Quan).toBe('');
  });

  it('keeps an empty dose empty when the unit changes', () => {
    selectMedicine();
    changeUnit(units()[1]);
    expect(row().value.Quan).toBe('');
    expect(row().value.Agentid).toBe('A2');
  });

  it('keeps 150 when a unit with a default quantity of 250 is chosen', () => {
    selectMedicine();
    enterDose('150');
    changeUnit(units()[1]);
    expect(row().value.Quan).toBe('150');
    expect(row().value.Agentid).toBe('A2');
    expect(row().value.Quanunit.Meinh).toBe('MG');
  });

  it('keeps a fractional dose when the unit changes', () => {
    selectMedicine();
    enterDose('1.5');
    changeUnit(units()[1]);
    expect(row().value.Quan).toBe('1.5');
  });

  it('keeps the entered dose across repeated unit changes', () => {
    selectMedicine();
    enterDose('150');
    changeUnit(units()[1]);
    changeUnit(units()[0]);
    changeUnit(units()[1]);
    expect(row().value.Quan).toBe('150');
    expect(row().value.Agentid).toBe('A2');
  });

  it('sends the entered dose and unit when the order is created', () => {
    completeRow();
    enterDose('1.5');
    create.onSubmitData();
    expect(prescriptionService.postData).toHaveBeenCalledWith('EstdordSet', jasmine.any(Object));
    const order = prescriptionService.postData.calls.mostRecent().args[1].TOSTD[0];
    expect(order.Quan).toBe('1.5');
    expect(order.Quanunit).toBe('MG');
  });

  it('blocks the order and flags the dose when it is empty', () => {
    completeRow();
    create.onSubmitData();
    expect(prescriptionService.postData).not.toHaveBeenCalled();
    expect(create.isFormSubmitted).toBe(true);
    expect(row().touched).toBe(true);
    expect(row().get('Quan').errors).toEqual({ required: true });
  });

  it('loads saved template doses unchanged', () => {
    const template = (Quan: string) => ({
      Agentid: 'A1', Drugid: 'D1', N1znr: 'Q12H', Result_Drug_Name: 'Test medication', Quan, Quanunit: 'MG',
      Formatdescr: '', Routedescr: 'ORAL', Pdur: '2', Pduru: 'TAG', Aprouteid: 'PO', Phformid: 'TABLET',
      Prncond: '', Prn: false, Descr: '', Complex: '', Dosdef: '', N1ztxt: '', TOCOMPLEX: [], TOCYCDEF: [],
    });
    create.processTemplateData([template('2.500'), template('0.000')] as any);
    expect(row(0).value.Quan).toBe('2.500');
    expect(row(1).value.Quan).toBe('0');
  });

  it('uses the entered dose for a defined-timing schedule', () => {
    completeRow();
    enterDose('150');
    row().patchValue({ N1znr: 'DEFTIM' });
    create.onChangeFrequencySet('DEFTIM', 0);
    expect(row().value.deftimcycleData[0].deftimDose).toBe('150');
    expect(row().value.Dosdef).toBe('150(08:00)');
    expect(row().value.Quan).toBe('150');
  });

  it('takes the dose, unit and agent from the first scheduled dose', () => {
    selectMedicine();
    create.FrequencySetcycle([
      { deftimDose: 2, deftimDosageUnit: 'MG', deftimTime: new Date(2030, 0, 1, 8), Agentid: 'A2' },
      { deftimDose: 3, deftimDosageUnit: 'MG', deftimTime: new Date(2030, 0, 1, 20), Agentid: 'A2' },
    ], 0, row().value.AgentidResult);
    expect(row().value.Quan).toBe(2);
    expect(row().value.Quanunit).toBe('MG');
    expect(row().value.Agentid).toBe('A2');
    expect(row().value.Dosdef).toBe('2(08:00)-3(20:00)');
  });

  for (const emptyDose of ['', null]) {
    it(`keeps the dose empty when the first scheduled dose is ${JSON.stringify(emptyDose)}`, () => {
      selectMedicine();
      create.FrequencySetcycle([
        { deftimDose: emptyDose, deftimDosageUnit: 'MG', deftimTime: new Date(2030, 0, 1, 8), Agentid: 'A2' },
      ], 0, row().value.AgentidResult);
      expect(row().value.Quan).toBe('');
      expect(row().get('Quan').errors).toEqual({ required: true });
    });
  }

  it('copies the entered dose into a complex order', () => {
    completeRow();
    enterDose('1.5');
    row().patchValue({ N1znr: 'Q24H', Pdur: '2', Pduru: 'TAG', Complex: true, AddDose: '' });
    create.openMoDetailPanel(0, row().value, row().valid, false);
    expect(row().value.TOCOMPLEX.length).toBe(1);
    expect(row().value.TOCOMPLEX[0].Quan).toBe('1.5');
    expect(row().value.TOCOMPLEX[0].Quanunit).toBe('MG');
  });
});

describe('Inpatient create order: dosage unit dropdown', () => {
  let fixture: ComponentFixture<CreateAdministrationComponent>;

  beforeEach(async () => {
    const fire = swal.fire.bind(swal);
    spyOn(swal, 'fire').and.callFake((options: any) => fire({
      ...options, showClass: { popup: '' }, hideClass: { popup: '' },
    }));
    await TestBed.configureTestingModule({
      declarations: [CreateAdministrationComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule,
        BsDatepickerModule.forRoot(), NoopAnimationsModule, NgbCollapseModule],
      providers: [
        DatePipe,
        { provide: ActivatedRoute, useValue: {} },
        { provide: NgbModal, useValue: {} },
        { provide: EPrescriptionService, useValue: {
          parameters: {},
          loadData: jasmine.createSpy('loadData').and.returnValue(EMPTY),
          postData: jasmine.createSpy('postData').and.returnValue(EMPTY),
        } },
        { provide: AddministrationService, useValue: {
          frequencyList: [{ CycleKey: '0000000002', N1id: 'Q12H', OptionField: 'Q12H' }],
          durationUnitList: [{ Unit: 'TAG', Text: 'Days' }],
          routeDropdownList: [], medicationDrugList: [], physicianList: [],
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

  it('keeps a typed 150 when the physician picks a unit whose default is 250', fakeAsync(() => {
    fixture = TestBed.createComponent(CreateAdministrationComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const form = component.drugArray.at(0);
    const unitList = units().map(unit => ({ ...unit, OptionField: unit.Mseht }));
    form.patchValue({ Result_Drug_Name: 'Test medication', AgentidResult: unitList, Quanunit: unitList[0], Agentid: 'A1' });
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const dose: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="Quan"]');
    expect(dose.value).toBe('');
    dose.value = '150';
    dose.dispatchEvent(new Event('input'));
    dose.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const unit = fixture.nativeElement.querySelector('ng-select[formControlName="Quanunit"]');
    unit.querySelector('.ng-select-container').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const option = Array.from(document.querySelectorAll('.ng-option'))
      .find((element: HTMLElement) => element.textContent.trim() === 'MG') as HTMLElement;
    expect(option).toBeDefined();
    option.click();
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();

    expect(form.value.Quanunit.Meinh).toBe('MG');
    expect(form.value.Agentid).toBe('A2');
    expect(form.value.Quan).toBe('150');
    expect(dose.value).toBe('150');
  }));
});
