import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingAssessmentComponent } from './nursing-assessment.component';

describe('NursingAssessmentComponent', () => {
  let component: NursingAssessmentComponent;
  let fixture: ComponentFixture<NursingAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
