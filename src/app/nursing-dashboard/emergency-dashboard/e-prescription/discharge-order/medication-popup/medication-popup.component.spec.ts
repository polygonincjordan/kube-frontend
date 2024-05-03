import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationPopupComponent } from './medication-popup.component';

describe('MedicationPopupComponent', () => {
  let component: MedicationPopupComponent;
  let fixture: ComponentFixture<MedicationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
