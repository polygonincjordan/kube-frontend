import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientProfileHistoryNurseComponent } from './patient-profile-history-nurse.component';

describe('PatientProfileHistoryNurseComponent', () => {
  let component: PatientProfileHistoryNurseComponent;
  let fixture: ComponentFixture<PatientProfileHistoryNurseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientProfileHistoryNurseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientProfileHistoryNurseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
