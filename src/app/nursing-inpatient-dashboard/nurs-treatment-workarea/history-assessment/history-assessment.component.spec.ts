import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryAssessmentComponent } from './history-assessment.component';

describe('HistoryAssessmentComponent', () => {
  let component: HistoryAssessmentComponent;
  let fixture: ComponentFixture<HistoryAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
