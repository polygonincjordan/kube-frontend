import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursAssessmentRestraintsComponent } from './nurs-assessment-restraints.component';

describe('NursAssessmentRestraintsComponent', () => {
  let component: NursAssessmentRestraintsComponent;
  let fixture: ComponentFixture<NursAssessmentRestraintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursAssessmentRestraintsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursAssessmentRestraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
