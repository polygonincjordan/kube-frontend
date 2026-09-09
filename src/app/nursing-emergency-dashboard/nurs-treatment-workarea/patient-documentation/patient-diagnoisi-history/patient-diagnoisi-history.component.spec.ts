import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDiagnoisiHistoryComponent } from './patient-diagnoisi-history.component';

describe('PatientDiagnoisiHistoryComponent', () => {
  let component: PatientDiagnoisiHistoryComponent;
  let fixture: ComponentFixture<PatientDiagnoisiHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDiagnoisiHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDiagnoisiHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
