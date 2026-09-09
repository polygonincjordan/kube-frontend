import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfusionAssessmentMethodComponent } from './confusion-assessment-method.component';

describe('ConfusionAssessmentMethodComponent', () => {
  let component: ConfusionAssessmentMethodComponent;
  let fixture: ComponentFixture<ConfusionAssessmentMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfusionAssessmentMethodComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfusionAssessmentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
