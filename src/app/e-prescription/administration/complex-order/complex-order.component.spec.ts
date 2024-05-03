import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexOrderComponent } from './complex-order.component';

describe('ComplexOrderComponent', () => {
  let component: ComplexOrderComponent;
  let fixture: ComponentFixture<ComplexOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplexOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplexOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
