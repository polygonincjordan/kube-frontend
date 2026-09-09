import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianFormComponent } from './physician-form.component';

describe('PhysicianFormComponent', () => {
  let component: PhysicianFormComponent;
  let fixture: ComponentFixture<PhysicianFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
