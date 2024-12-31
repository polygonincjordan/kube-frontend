import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumericRatingScaleComponent } from './numeric-rating-scale.component';

describe('NumericRatingScaleComponent', () => {
  let component: NumericRatingScaleComponent;
  let fixture: ComponentFixture<NumericRatingScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumericRatingScaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumericRatingScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
