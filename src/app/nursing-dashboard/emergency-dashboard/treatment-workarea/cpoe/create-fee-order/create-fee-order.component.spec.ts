import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFeeOrderComponent } from './create-fee-order.component';

describe('CreateFeeOrderComponent', () => {
  let component: CreateFeeOrderComponent;
  let fixture: ComponentFixture<CreateFeeOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateFeeOrderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateFeeOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
