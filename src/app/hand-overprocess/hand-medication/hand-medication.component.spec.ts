import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandMedicationComponent } from './hand-medication.component';

describe('HandMedicationComponent', () => {
  let component: HandMedicationComponent;
  let fixture: ComponentFixture<HandMedicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandMedicationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandMedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
