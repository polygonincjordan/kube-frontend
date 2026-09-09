import { TestBed } from '@angular/core/testing';

import { PatientDocumentationService } from './patient-documentation.service';

describe('PatientDocumentationService', () => {
  let service: PatientDocumentationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientDocumentationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
