import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianOrdersComponent } from './physician-orders.component';

describe('PhysicianOrdersComponent', () => {
  let component: PhysicianOrdersComponent;
  let fixture: ComponentFixture<PhysicianOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianOrdersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
