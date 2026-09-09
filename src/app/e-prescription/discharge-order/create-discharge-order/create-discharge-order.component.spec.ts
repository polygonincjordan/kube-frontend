import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDischargeOrderComponent } from './create-discharge-order.component';

describe('CreateDischargeOrderComponent', () => {
  let component: CreateDischargeOrderComponent;
  let fixture: ComponentFixture<CreateDischargeOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDischargeOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDischargeOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
