import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientProfileHeaderComponent } from './patient-profile-header.component';

describe('PatientProfileHeaderComponent', () => {
  let component: PatientProfileHeaderComponent;
  let fixture: ComponentFixture<PatientProfileHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientProfileHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientProfileHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
