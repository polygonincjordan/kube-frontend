import { TestBed } from '@angular/core/testing';

import { NursingInpatientDashboardGuard } from './nursing-inpatient-dashboard.guard';

describe('NursingInpatientDashboardGuard', () => {
  let guard: NursingInpatientDashboardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NursingInpatientDashboardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
