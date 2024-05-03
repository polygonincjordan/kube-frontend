import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSelectMedicineComponent } from './search-select-medicine.component';

describe('SearchSelectMedicineComponent', () => {
  let component: SearchSelectMedicineComponent;
  let fixture: ComponentFixture<SearchSelectMedicineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchSelectMedicineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchSelectMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
