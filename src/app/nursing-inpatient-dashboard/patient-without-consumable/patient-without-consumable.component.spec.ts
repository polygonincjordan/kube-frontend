import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientWithoutConsumableComponent } from './patient-without-consumable.component';

describe('PatientWithoutConsumableComponent', () => {
  let component: PatientWithoutConsumableComponent;
  let fixture: ComponentFixture<PatientWithoutConsumableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientWithoutConsumableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientWithoutConsumableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
