import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeOrderHistoryComponent } from './fee-order-history.component';

describe('FeeOrderHistoryComponent', () => {
  let component: FeeOrderHistoryComponent;
  let fixture: ComponentFixture<FeeOrderHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeeOrderHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeeOrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
