import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayCaseDashboardComponent } from './nursing-inpatient-dashboard.component';

describe('DayCaseDashboardComponent', () => {
  let component: DayCaseDashboardComponent;
  let fixture: ComponentFixture<DayCaseDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DayCaseDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DayCaseDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
