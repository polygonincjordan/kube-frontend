import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosesInPatientComponent } from './diagnoses-in-patient.component';

describe('DiagnosesInPatientComponent', () => {
  let component: DiagnosesInPatientComponent;
  let fixture: ComponentFixture<DiagnosesInPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosesInPatientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosesInPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
