import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PediatricsFallRiskAssessmentComponent } from './pediatrics-fall-risk-assessment.component';

describe('PediatricsFallRiskAssessmentComponent', () => {
  let component: PediatricsFallRiskAssessmentComponent;
  let fixture: ComponentFixture<PediatricsFallRiskAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PediatricsFallRiskAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PediatricsFallRiskAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
