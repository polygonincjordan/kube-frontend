import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EOrderSelectComponent } from './e-order-select.component';

describe('EOrderSelectComponent', () => {
  let component: EOrderSelectComponent;
  let fixture: ComponentFixture<EOrderSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EOrderSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EOrderSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
