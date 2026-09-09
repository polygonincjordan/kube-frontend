import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationSelectMedicineEorderComponent } from './administration-select-medicine-eorder.component';

describe('AdministrationSelectMedicineEorderComponent', () => {
  let component: AdministrationSelectMedicineEorderComponent;
  let fixture: ComponentFixture<AdministrationSelectMedicineEorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrationSelectMedicineEorderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrationSelectMedicineEorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
