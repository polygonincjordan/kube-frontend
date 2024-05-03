import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EOrderComponent } from './e-order.component';

describe('EOrderComponent', () => {
  let component: EOrderComponent;
  let fixture: ComponentFixture<EOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EOrderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
