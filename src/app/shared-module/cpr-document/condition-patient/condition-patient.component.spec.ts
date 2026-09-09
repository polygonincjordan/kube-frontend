import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionPatientComponent } from './condition-patient.component';

describe('ConditionPatientComponent', () => {
  let component: ConditionPatientComponent;
  let fixture: ComponentFixture<ConditionPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConditionPatientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConditionPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
