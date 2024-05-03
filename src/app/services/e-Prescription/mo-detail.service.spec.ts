import { TestBed } from '@angular/core/testing';

import { MoDetailService } from './mo-detail.service';

describe('MoDetailService', () => {
  let service: MoDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
