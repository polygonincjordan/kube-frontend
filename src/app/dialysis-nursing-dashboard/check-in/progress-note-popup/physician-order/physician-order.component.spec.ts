import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianOrderComponent } from './physician-order.component';

describe('PhysicianOrderComponent', () => {
  let component: PhysicianOrderComponent;
  let fixture: ComponentFixture<PhysicianOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
