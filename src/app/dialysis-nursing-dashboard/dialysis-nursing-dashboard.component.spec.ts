import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialysisNursingDashboardComponent } from './dialysis-nursing-dashboard.component';

describe('DialysisNursingDashboardComponent', () => {
  let component: DialysisNursingDashboardComponent;
  let fixture: ComponentFixture<DialysisNursingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialysisNursingDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialysisNursingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
