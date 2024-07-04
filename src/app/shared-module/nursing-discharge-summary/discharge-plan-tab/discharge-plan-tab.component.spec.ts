import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargePlanTabComponent } from './discharge-plan-tab.component';

describe('DischargePlanTabComponent', () => {
  let component: DischargePlanTabComponent;
  let fixture: ComponentFixture<DischargePlanTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargePlanTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargePlanTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
