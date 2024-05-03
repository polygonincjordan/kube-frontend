import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EOrderMedicationComponent } from './e-order-medication.component';

describe('EOrderMedicationComponent', () => {
  let component: EOrderMedicationComponent;
  let fixture: ComponentFixture<EOrderMedicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EOrderMedicationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EOrderMedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
