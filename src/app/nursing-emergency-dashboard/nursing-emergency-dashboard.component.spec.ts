import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingEmergencyDashboardComponent } from './nursing-emergency-dashboard.component';

describe('NursingEmergencyDashboardComponent', () => {
  let component: NursingEmergencyDashboardComponent;
  let fixture: ComponentFixture<NursingEmergencyDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingEmergencyDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingEmergencyDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
