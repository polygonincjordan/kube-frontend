import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianAllergyComponent } from './physician-allergy.component';

describe('PhysicianAllergyComponent', () => {
  let component: PhysicianAllergyComponent;
  let fixture: ComponentFixture<PhysicianAllergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianAllergyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianAllergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
