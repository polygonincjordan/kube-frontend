import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMedicalReportComponent } from './patient-medical-report.component';

describe('PatientMedicalReportComponent', () => {
  let component: PatientMedicalReportComponent;
  let fixture: ComponentFixture<PatientMedicalReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientMedicalReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientMedicalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
