import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingInitialAssessmentComponent } from './nursing-initial-assessment.component';

describe('NursingInitialAssessmentComponent', () => {
  let component: NursingInitialAssessmentComponent;
  let fixture: ComponentFixture<NursingInitialAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingInitialAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingInitialAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
