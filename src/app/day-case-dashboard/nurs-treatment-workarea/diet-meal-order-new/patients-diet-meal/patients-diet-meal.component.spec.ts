import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientsDietMealComponent } from './patients-diet-meal.component';

describe('PatientsDietMealComponent', () => {
  let component: PatientsDietMealComponent;
  let fixture: ComponentFixture<PatientsDietMealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientsDietMealComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientsDietMealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
