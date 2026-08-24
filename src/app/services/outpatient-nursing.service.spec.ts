import { TestBed } from '@angular/core/testing';

import { OutpatientNursingService } from './outpatient-nursing.service';

describe('OutpatientNursingService', () => {
  let service: OutpatientNursingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutpatientNursingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
