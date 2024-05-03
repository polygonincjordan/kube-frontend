import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianErVitalsComponent } from './physician-er-vitals.component';

describe('PhysicianErVitalsComponent', () => {
  let component: PhysicianErVitalsComponent;
  let fixture: ComponentFixture<PhysicianErVitalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianErVitalsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianErVitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
