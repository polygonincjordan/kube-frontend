import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingDashboardComponent } from './nursing-dashboard.component';

describe('NursingDashboardComponent', () => {
  let component: NursingDashboardComponent;
  let fixture: ComponentFixture<NursingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
