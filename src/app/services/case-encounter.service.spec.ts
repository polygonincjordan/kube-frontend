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

  [
    ['another case', (r: any) => r.falnr = '21'],
    ['another patient', (r: any) => r.CASTOPATSET.patnr = '11'],
    ['another institution', (r: any) => r.einri = '2000'],
    ['an inconsistent movement', (r: any) => r.lfdnr = '00009'],
    ['missing movements', (r: any) => { r.lfdnr = ''; r.CASTOMOVEMENTSET.results = []; }],
  ].forEach(([label, change]: any[]) => {
    it('rejects ' + label, () => {
      change(record);
      let rejected = false;
      service.resolve('10', '1000', '20').subscribe({ next: () => fail('Must not resolve'), error: () => rejected = true });
      expect(rejected).toBe(true);
    });
  });

  it('rejects an empty result and upstream failures', () => {
    [of({ d: { results: [] } }), throwError(() => new Error('Unavailable'))].forEach(response => {
      api.loadData.and.returnValue(response);
      let rejected = false;
      service.resolve('10', '1000', '20').subscribe({ next: () => fail('Must not resolve'), error: () => rejected = true });
      expect(rejected).toBe(true);
    });
  });

  it('does not query SAP for invalid identifiers', () => {
    service.resolve('10', '1000', 'undefined').subscribe({ next: () => fail('Must not resolve'), error: () => {} });
    expect(api.loadData).not.toHaveBeenCalled();
  });
});
