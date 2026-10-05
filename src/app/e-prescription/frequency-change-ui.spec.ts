import { CommonModule, DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EMPTY } from 'rxjs';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { CreateAdministrationComponent } from './administration/create-administration/create-administration.component';
import { EditMedicationComponent } from './prior-admission/edit-medication/edit-medication.component';
import { CreateAdministrationComponent as EmergencyCreate } from '../emergency-dashboard/e-prescription/administration/create-administration/create-administration.component';
import { EditMedicationComponent as EmergencyEdit } from '../emergency-dashboard/e-prescription/prior-admission/edit-medication/edit-medication.component';

const screens = [
  { name: 'Inpatient create', component: CreateAdministrationComponent, create: true },
  { name: 'Inpatient edit', component: EditMedicationComponent, create: false },
  { name: 'Emergency create', component: EmergencyCreate, create: true },
  { name: 'Emergency edit', component: EmergencyEdit, create: false },
];

screens.forEach(screen => describe(`${screen.name}: frequency dropdown`, () => {
  let fixture: ComponentFixture<any>;
  const frequencies = [
    { CycleKey: '0000000001', N1id: 'STAT', OptionField: 'STAT' },
    { CycleKey: '0000000002', N1id: 'Q12H', OptionField: 'Q12H' },
    { CycleKey: '0000000003', N1id: 'DAILY', OptionField: 'DAILY' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [screen.component],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule,
        BsDatepickerModule.forRoot(), NoopAnimationsModule, NgbCollapseModule],
      providers: [
        DatePipe,
        { provide: ActivatedRoute, useValue: {} },
        { provide: NgbModal, useValue: {} },
        { provide: EPrescriptionService, useValue: { parameters: {}, loadData: () => EMPTY } },
        { provide: AddministrationService, useValue: {
          frequencyList: frequencies,
          durationUnitList: [{ Unit: 'TAG', Text: 'Days' }, { Unit: 'DOS', Text: 'Dose' }],
          routeDropdownList: [], medicationDrugList: [], physicianList: [],
          loadDropdownList: () => {},
        } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  ['Q12H', 'DAILY'].forEach(previousFrequency => it(`replaces fields and clears timed-dose panel from ${previousFrequency} to STAT`, fakeAsync(() => {
    fixture = TestBed.createComponent(screen.component as any);
    const component = fixture.componentInstance;
    const values = {
      Result_Drug_Name: 'Test medication', Phformid: 'TABLET', Routedescr: 'ORAL',
      Quan: 1, Quanunit: 'EA',
      N1znr: frequencies.find(item => item.N1id === previousFrequency).CycleKey,
      N1id: previousFrequency,
      Dosdef: previousFrequency === 'DAILY' ? '1(08:00)' : '',
      IsFrequencyDeftim: previousFrequency === 'DAILY',
      deftimcycleData: previousFrequency === 'DAILY' ? [{
        deftimDose: 1, deftimDosageUnit: 'EA', deftimTime: new Date(2030, 0, 1, 8),
      }] : [],
      Pdur: 2, Pduru: 'TAG', StartD: new Date(2030, 0, 1, 8),
      EndD: new Date(2030, 0, 3, 8), EndT: 'PT08H00M00S',
    };
    if (!screen.create) {
      component.editdata = values;
      spyOn(component, 'onSelectMedicine');
    }
    fixture.detectChanges();
    const form = screen.create ? component.drugArray.at(0) : component.editprofileForm;
    if (screen.create) { form.patchValue(values); }
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const duration = fixture.nativeElement.querySelector('input[formControlName="Pdur"]');
    const durationUnit = fixture.nativeElement.querySelector('ng-select[formControlName="Pduru"]');
    const endDate = fixture.nativeElement.querySelector('input[formControlName="EndD"]');
    expect(duration.value).toBe('2');
    expect(durationUnit.textContent).toContain('Days');
    expect(endDate.value).not.toBe('');
    if (previousFrequency === 'DAILY' && form.get('IsFrequencyDeftim')) {
      expect(fixture.nativeElement.querySelector('frequency-deftim')).not.toBeNull();
    }

    const frequency = fixture.nativeElement.querySelector('ng-select[formControlName="N1znr"]');
    frequency.querySelector('.ng-select-container').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const option = Array.from(document.querySelectorAll('.ng-option'))
      .find((element: HTMLElement) => element.textContent.trim() === 'STAT') as HTMLElement;
    expect(option).toBeDefined();
    option.click();
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();

    expect(form.value.N1znr).toBe('0000000001');
    expect(form.value.Pdur).toBe(1);
    expect(form.value.Pduru).toBe('DOS');
    expect(form.value.EndD).toEqual(new Date(2030, 0, 2, 8));
    expect(duration.value).toBe('1');
    expect(durationUnit.textContent).toContain('Dose');
    expect(endDate.value).not.toBe('');
    if (form.get('IsFrequencyDeftim')) {
      expect(form.value.IsFrequencyDeftim).toBe(false);
      expect(form.value.deftimcycleData).toEqual([]);
      expect(form.value.Dosdef).toBe('');
      expect(fixture.nativeElement.querySelector('frequency-deftim')).toBeNull();
    }
  })));
}));
