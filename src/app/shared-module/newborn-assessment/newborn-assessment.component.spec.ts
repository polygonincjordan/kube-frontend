import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewbornAssessmentComponent } from './newborn-assessment.component';

describe('NewbornAssessmentComponent', () => {
  let component: NewbornAssessmentComponent;
  let fixture: ComponentFixture<NewbornAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewbornAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewbornAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
