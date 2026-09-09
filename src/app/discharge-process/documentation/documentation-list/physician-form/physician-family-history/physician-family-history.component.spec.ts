import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianFamilyHistoryComponent } from './physician-family-history.component';

describe('PhysicianFamilyHistoryComponent', () => {
  let component: PhysicianFamilyHistoryComponent;
  let fixture: ComponentFixture<PhysicianFamilyHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianFamilyHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianFamilyHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
