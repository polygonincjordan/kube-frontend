import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientEducationDetailsComponent } from './patient-education-details.component';

describe('PatientEducationDetailsComponent', () => {
  let component: PatientEducationDetailsComponent;
  let fixture: ComponentFixture<PatientEducationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientEducationDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientEducationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
