import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAssignmentComponent } from './patient-assignment.component';

describe('PatientAssignmentComponent', () => {
  let component: PatientAssignmentComponent;
  let fixture: ComponentFixture<PatientAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAssignmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
