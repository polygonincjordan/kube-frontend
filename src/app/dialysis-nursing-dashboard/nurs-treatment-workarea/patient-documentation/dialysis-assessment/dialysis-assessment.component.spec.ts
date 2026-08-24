import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialysisAssessmentComponent } from './dialysis-assessment.component';

describe('DialysisAssessmentComponent', () => {
  let component: DialysisAssessmentComponent;
  let fixture: ComponentFixture<DialysisAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialysisAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialysisAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
