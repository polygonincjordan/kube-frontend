import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NurErAllergyComponent } from './nur-er-allergy.component';

describe('NurErAllergyComponent', () => {
  let component: NurErAllergyComponent;
  let fixture: ComponentFixture<NurErAllergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NurErAllergyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NurErAllergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
