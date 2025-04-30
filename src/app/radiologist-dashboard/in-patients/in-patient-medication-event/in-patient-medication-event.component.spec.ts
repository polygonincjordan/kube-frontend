import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InPatientMedicationEventComponent } from './in-patient-medication-event.component';

describe('InPatientMedicationEventComponent', () => {
  let component: InPatientMedicationEventComponent;
  let fixture: ComponentFixture<InPatientMedicationEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InPatientMedicationEventComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InPatientMedicationEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
