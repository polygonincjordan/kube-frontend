import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianOrderListComponent } from './physician-order-list.component';

describe('PhysicianOrderListComponent', () => {
  let component: PhysicianOrderListComponent;
  let fixture: ComponentFixture<PhysicianOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianOrderListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
