import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingAdmissionAssessmentComponent } from './nursing-admission-assessment.component';

describe('NursingAdmissionAssessmentComponent', () => {
  let component: NursingAdmissionAssessmentComponent;
  let fixture: ComponentFixture<NursingAdmissionAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingAdmissionAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingAdmissionAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
