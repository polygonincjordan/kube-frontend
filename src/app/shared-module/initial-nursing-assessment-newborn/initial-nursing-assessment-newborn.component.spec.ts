import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialNursingAssessmentNewbornComponent } from './initial-nursing-assessment-newborn.component';

describe('InitialNursingAssessmentNewbornComponent', () => {
  let component: InitialNursingAssessmentNewbornComponent;
  let fixture: ComponentFixture<InitialNursingAssessmentNewbornComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitialNursingAssessmentNewbornComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialNursingAssessmentNewbornComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
