import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EOrderEmergencyComponent } from './e-order-emergency.component';

describe('EOrderEmergencyComponent', () => {
  let component: EOrderEmergencyComponent;
  let fixture: ComponentFixture<EOrderEmergencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EOrderEmergencyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EOrderEmergencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
