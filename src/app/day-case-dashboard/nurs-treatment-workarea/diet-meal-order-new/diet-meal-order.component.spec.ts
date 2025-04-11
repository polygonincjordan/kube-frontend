import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietMealOrderComponent } from './diet-meal-order.component';

describe('DietMealOrderComponent', () => {
  let component: DietMealOrderComponent;
  let fixture: ComponentFixture<DietMealOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DietMealOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietMealOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
