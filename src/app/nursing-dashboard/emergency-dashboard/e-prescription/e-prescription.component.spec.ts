import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EprescriptionComponent } from './e-prescription.component';

describe('EPrescriptionComponent', () => {
  let component: EprescriptionComponent;
  let fixture: ComponentFixture<EprescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EprescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EprescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
