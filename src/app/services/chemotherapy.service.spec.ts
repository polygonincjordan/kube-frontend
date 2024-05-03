import { TestBed } from '@angular/core/testing';

import { ChemotherapyService } from './chemotherapy.service';

describe('ChemotherapyService', () => {
  let service: ChemotherapyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChemotherapyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
