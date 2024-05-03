import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSetsConfigurationComponent } from './order-sets-configuration.component';

describe('OrderSetsConfigurationComponent', () => {
  let component: OrderSetsConfigurationComponent;
  let fixture: ComponentFixture<OrderSetsConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderSetsConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderSetsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
