import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersTemplatesComponent } from './orders-templates.component';

describe('OrdersTemplatesComponent', () => {
  let component: OrdersTemplatesComponent;
  let fixture: ComponentFixture<OrdersTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersTemplatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
