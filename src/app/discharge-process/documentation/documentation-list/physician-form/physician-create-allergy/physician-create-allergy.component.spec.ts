import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianCreateAllergyComponent } from './physician-create-allergy.component';

describe('PhysicianCreateAllergyComponent', () => {
  let component: PhysicianCreateAllergyComponent;
  let fixture: ComponentFixture<PhysicianCreateAllergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianCreateAllergyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianCreateAllergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
