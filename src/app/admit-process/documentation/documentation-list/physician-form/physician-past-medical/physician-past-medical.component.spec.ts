import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianPastMedicalComponent } from './physician-past-medical.component';

describe('PhysicianPastMedicalComponent', () => {
  let component: PhysicianPastMedicalComponent;
  let fixture: ComponentFixture<PhysicianPastMedicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianPastMedicalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianPastMedicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
