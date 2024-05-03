import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EOrderFeesServiceComponent } from './e-order-fees-service.component';

describe('EOrderFeesServiceComponent', () => {
  let component: EOrderFeesServiceComponent;
  let fixture: ComponentFixture<EOrderFeesServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EOrderFeesServiceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EOrderFeesServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
