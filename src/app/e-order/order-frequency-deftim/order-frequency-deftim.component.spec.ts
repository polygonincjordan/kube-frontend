import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFrequencyDeftimComponent } from './order-frequency-deftim.component';

describe('OrderFrequencyDeftimComponent', () => {
  let component: OrderFrequencyDeftimComponent;
  let fixture: ComponentFixture<OrderFrequencyDeftimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderFrequencyDeftimComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderFrequencyDeftimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
