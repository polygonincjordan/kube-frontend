import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationSearchSelectMedicineComponent } from './administration-search-select-medicine.component';

describe('AdministrationSearchSelectMedicineComponent', () => {
  let component: AdministrationSearchSelectMedicineComponent;
  let fixture: ComponentFixture<AdministrationSearchSelectMedicineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrationSearchSelectMedicineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrationSearchSelectMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
