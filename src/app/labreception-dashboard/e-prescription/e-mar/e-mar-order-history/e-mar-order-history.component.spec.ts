import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EMarOrderHistoryComponent } from './e-mar-order-history.component';

describe('EMarOrderHistoryComponent', () => {
  let component: EMarOrderHistoryComponent;
  let fixture: ComponentFixture<EMarOrderHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EMarOrderHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EMarOrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
