import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianPastSurgicalComponent } from './physician-past-surgical.component';

describe('PhysicianPastSurgicalComponent', () => {
  let component: PhysicianPastSurgicalComponent;
  let fixture: ComponentFixture<PhysicianPastSurgicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianPastSurgicalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianPastSurgicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
