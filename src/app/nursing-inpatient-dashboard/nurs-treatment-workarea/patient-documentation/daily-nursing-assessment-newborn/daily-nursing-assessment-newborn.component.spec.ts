import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyNursingAssessmentNewbornComponent } from './daily-nursing-assessment-newborn.component';

describe('DailyNursingAssessmentNewbornComponent', () => {
  let component: DailyNursingAssessmentNewbornComponent;
  let fixture: ComponentFixture<DailyNursingAssessmentNewbornComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyNursingAssessmentNewbornComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyNursingAssessmentNewbornComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
