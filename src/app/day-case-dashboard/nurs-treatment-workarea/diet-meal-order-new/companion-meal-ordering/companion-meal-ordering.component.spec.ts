import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanionMealOrderingComponent } from './companion-meal-ordering.component';

describe('CompanionMealOrderingComponent', () => {
  let component: CompanionMealOrderingComponent;
  let fixture: ComponentFixture<CompanionMealOrderingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanionMealOrderingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanionMealOrderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
