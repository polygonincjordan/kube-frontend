import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EOrderHistoryComponent } from './e-order-history.component';

describe('EOrderHistoryComponent', () => {
  let component: EOrderHistoryComponent;
  let fixture: ComponentFixture<EOrderHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EOrderHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EOrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
