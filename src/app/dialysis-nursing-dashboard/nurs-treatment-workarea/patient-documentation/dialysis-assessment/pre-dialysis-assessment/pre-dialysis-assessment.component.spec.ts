import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreDialysisAssessmentComponent } from './pre-dialysis-assessment.component';

describe('PreDialysisAssessmentComponent', () => {
  let component: PreDialysisAssessmentComponent;
  let fixture: ComponentFixture<PreDialysisAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreDialysisAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreDialysisAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
