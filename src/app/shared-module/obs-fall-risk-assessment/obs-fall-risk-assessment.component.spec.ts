import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObsFallRiskAssessmentComponent } from './obs-fall-risk-assessment.component';

describe('ObsFallRiskAssessmentComponent', () => {
  let component: ObsFallRiskAssessmentComponent;
  let fixture: ComponentFixture<ObsFallRiskAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObsFallRiskAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObsFallRiskAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
