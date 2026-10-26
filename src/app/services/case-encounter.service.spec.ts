import { of, throwError } from 'rxjs';
import { CaseEncounterService } from './case-encounter.service';

describe('CaseEncounterService', () => {
  let api: any;
  let service: CaseEncounterService;
  let record: any;
  beforeEach(() => {
    record = {
      falnr: '0000000020', einri: '1000', lfdnr: '00002',
      CASTOPATSET: { patnr: '0000000010' },
      CASTOMOVEMENTSET: { results: [{ movmntSeq: '00001' }, { movmntSeq: '00002' }] },
    };
    api = { loadData: jasmine.createSpy().and.callFake(() => of({ d: { results: [record] } })) };
    service = new CaseEncounterService(api);
  });

  it('loads the selected case and returns its complete encounter key', () => {
    service.resolve('10', '1000', '20').subscribe(result => {
      expect(result).toEqual({ Patnr: '0000000010', Einri: '1000', Falnr: '0000000020', Lfdnr: '00002' });
    });
    expect(api.loadData.calls.mostRecent().args.slice(0, 3)).toEqual(['CASESET', ['0000000020'], 'falnr']);
  });

  it('prefers the explicit case movement over a later listed movement', () => {
    record.lfdnr = '00001';
    service.resolve('10', '1000', '20').subscribe(result => expect(result.Lfdnr).toBe('00001'));
  });

  it('uses the latest movement from this case when no case movement is supplied', () => {
    record.lfdnr = '';
    record.CASTOMOVEMENTSET.results = [{ movmntSeq: '2' }, { movmntSeq: '10' }];
    service.resolve('10', '1000', '20').subscribe(result => expect(result.Lfdnr).toBe('00010'));
  });

  it('supports the legacy wrapped response', () => {
    api.loadData.and.returnValue(of({ _body: JSON.stringify({ d: { results: [record] } }) }));
    service.resolve('10', '1000', '20').subscribe(result => expect(result.Lfdnr).toBe('00002'));
  });

  it('keeps a movement chosen in the link when it belongs to this case', () => {
    service.resolve('10', '1000', '20', '1').subscribe(result => expect(result.Lfdnr).toBe('00001'));
  });

  it('ignores a chosen movement that belongs to another case', () => {
    service.resolve('10', '1000', '20', '00007').subscribe(result => expect(result.Lfdnr).toBe('00002'));
  });

  [
    ['another case', 'invalid-identifiers', (r: any) => r.falnr = '21'],
    ['another patient', 'patient-case-mismatch', (r: any) => r.CASTOPATSET.patnr = '11'],
    ['another institution', 'patient-case-mismatch', (r: any) => r.einri = '2000'],
    ['an inconsistent movement', 'no-movement', (r: any) => r.lfdnr = '00009'],
    ['missing movements', 'no-movement', (r: any) => { r.lfdnr = ''; r.CASTOMOVEMENTSET.results = []; }],
  ].forEach(([label, reason, change]: any[]) => {
    it(`rejects ${label} as ${reason}`, () => {
      change(record);
      let rejected = '';
      service.resolve('10', '1000', '20').subscribe({
        next: () => fail('Must not resolve'), error: error => rejected = error.reason });
      expect(rejected).toBe(reason);
    });
  });

  it('rejects another patient even when the chosen movement belongs to the case', () => {
    record.CASTOPATSET.patnr = '11';
    let rejected = '';
    service.resolve('10', '1000', '20', '00001').subscribe({
      next: () => fail('Must not resolve'), error: error => rejected = error.reason });
    expect(rejected).toBe('patient-case-mismatch');
  });

  it('rejects an empty result and upstream failures with their reasons', () => {
    [[of({ d: { results: [] } }), 'invalid-identifiers'],
     [throwError(() => new Error('Unavailable')), 'case-lookup-failed']].forEach(([response, reason]: any[]) => {
      api.loadData.and.returnValue(response);
      let rejected = '';
      service.resolve('10', '1000', '20').subscribe({ next: () => fail('Must not resolve'), error: error => rejected = error.reason });
      expect(rejected).toBe(reason);
    });
  });

  it('does not query SAP for invalid identifiers', () => {
    let rejected = '';
    service.resolve('10', '1000', 'undefined').subscribe({ next: () => fail('Must not resolve'), error: error => rejected = error.reason });
    expect(rejected).toBe('invalid-identifiers');
    expect(api.loadData).not.toHaveBeenCalled();
  });
});
