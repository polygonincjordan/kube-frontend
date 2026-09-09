import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPatientFallAssessmentComponent } from './post-patient-fall-assessment.component';

describe('PostPatientFallAssessmentComponent', () => {
  let component: PostPatientFallAssessmentComponent;
  let fixture: ComponentFixture<PostPatientFallAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostPatientFallAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostPatientFallAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
