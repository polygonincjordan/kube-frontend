import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeDetailsTabComponent } from './discharge-details-tab.component';

describe('DischargeDetailsTabComponent', () => {
  let component: DischargeDetailsTabComponent;
  let fixture: ComponentFixture<DischargeDetailsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargeDetailsTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargeDetailsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
