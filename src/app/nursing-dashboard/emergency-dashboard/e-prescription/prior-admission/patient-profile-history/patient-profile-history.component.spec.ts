import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientProfileHistoryComponent } from './patient-profile-history.component';

describe('PatientProfileHistoryComponent', () => {
  let component: PatientProfileHistoryComponent;
  let fixture: ComponentFixture<PatientProfileHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientProfileHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientProfileHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
