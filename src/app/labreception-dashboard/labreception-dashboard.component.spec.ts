import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabreceptionDashboardComponent } from './labreception-dashboard.component';

describe('LabreceptionDashboardComponent', () => {
  let component: LabreceptionDashboardComponent;
  let fixture: ComponentFixture<LabreceptionDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabreceptionDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabreceptionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
