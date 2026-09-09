import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaemodialysisMonitoringComponent } from './haemodialysis-monitoring.component';

describe('HaemodialysisMonitoringComponent', () => {
  let component: HaemodialysisMonitoringComponent;
  let fixture: ComponentFixture<HaemodialysisMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaemodialysisMonitoringComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaemodialysisMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
