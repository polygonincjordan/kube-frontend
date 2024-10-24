import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EOrderMainComponent } from './e-order-main.component';

describe('EOrderMainComponent', () => {
  let component: EOrderMainComponent;
  let fixture: ComponentFixture<EOrderMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EOrderMainComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EOrderMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
