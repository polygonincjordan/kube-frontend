import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveCartComponent } from './receive-cart.component';

describe('ReceiveCartComponent', () => {
  let component: ReceiveCartComponent;
  let fixture: ComponentFixture<ReceiveCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiveCartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiveCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
