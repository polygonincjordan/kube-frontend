import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderConfigurationCreateComponent } from './order-configuration-create.component';

describe('OrderConfigurationCreateComponent', () => {
  let component: OrderConfigurationCreateComponent;
  let fixture: ComponentFixture<OrderConfigurationCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderConfigurationCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderConfigurationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
