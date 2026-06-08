import {
  buildBlockedMessage,
  findBlockedLabRadItems,
  getBlockedStatus,
  getServiceName,
  isPerformedStatus,
  normalizeStatus,
} from './clinical-order-cancellation.util';

describe('clinical-order-cancellation.util', () => {
  describe('normalizeStatus', () => {
    it('lower-cases, collapses spaces and trims', () => {
      expect(normalizeStatus('  Partially   Done ')).toBe('partially done');
      expect(normalizeStatus('NOT DONE')).toBe('not done');
      expect(normalizeStatus(null)).toBe('');
      expect(normalizeStatus(undefined)).toBe('');
    });
  });

  describe('isPerformedStatus — blocked (performed) statuses', () => {
    [
      'Done',
      'done',
      'Completed',
      'Completed with abnormal',
      'Partially done with abnormal',
      'Partially Done',
      'Performed',
      'Partially Performed',
    ].forEach((status) => {
      it(`blocks "${status}"`, () => {
        expect(isPerformedStatus(status)).toBe(true);
      });
    });
  });

  describe('isPerformedStatus — allowed (not performed) statuses', () => {
    [
      'Not done',
      'Not Done',
      'NOT DONE',
      'Not yet done',
      'Not performed',
      'Not completed',
      'Planned',
      'Cancelled',
      'Canceled',
      'Ordered',
      'Incomplete',
      '--',
      '',
      null,
      undefined,
    ].forEach((status) => {
      it(`allows ${JSON.stringify(status)}`, () => {
        expect(isPerformedStatus(status as any)).toBe(false);
      });
    });
  });

  describe('getBlockedStatus', () => {
    it('reads the displayed Status field first', () => {
      expect(getBlockedStatus({ Status: 'Completed' })).toBe('Completed');
      expect(getBlockedStatus({ Status: 'Not done' })).toBe('');
    });

    it('falls back to result-status text fields', () => {
      expect(
        getBlockedStatus({ Status: 'Not done', ZZRESULT_STATUS_TEXT: 'Partially done with abnormal' })
      ).toBe('Partially done with abnormal');
    });

    it('returns empty string for empty / missing status', () => {
      expect(getBlockedStatus({ Status: '--' })).toBe('');
      expect(getBlockedStatus({})).toBe('');
      expect(getBlockedStatus(null)).toBe('');
    });
  });

  describe('getServiceName', () => {
    it('returns the first available name field', () => {
      expect(getServiceName({ Leitxt: 'CBC' })).toBe('CBC');
      expect(getServiceName({ Leistung: 'X-Ray Chest' })).toBe('X-Ray Chest');
      expect(getServiceName({})).toBe('');
    });
  });

  describe('findBlockedLabRadItems', () => {
    it('returns only performed items with service + status', () => {
      const items = [
        { Leitxt: 'CBC', Status: 'Completed' },
        { Leitxt: 'PTT', Status: 'Not done' },
        { Leistung: 'CT Head', Status: 'Done' },
      ];
      expect(findBlockedLabRadItems(items)).toEqual([
        { service: 'CBC', status: 'Completed' },
        { service: 'CT Head', status: 'Done' },
      ]);
    });

    it('handles non-array / empty input', () => {
      expect(findBlockedLabRadItems(null)).toEqual([]);
      expect(findBlockedLabRadItems([])).toEqual([]);
      expect(findBlockedLabRadItems([{ Status: 'Not done' }])).toEqual([]);
    });
  });

  describe('buildBlockedMessage', () => {
    it('returns the base message with no items', () => {
      expect(buildBlockedMessage([])).toContain('Cancellation is not allowed');
    });

    it('lists affected services and de-duplicates', () => {
      const msg = buildBlockedMessage([
        { service: 'CBC', status: 'Completed' },
        { service: 'CBC', status: 'Completed' },
        { service: '', status: 'Done' },
      ]);
      expect(msg).toContain('CBC — Completed');
      expect(msg).toContain('Done');
      expect(msg.indexOf('CBC — Completed')).toBe(msg.lastIndexOf('CBC — Completed'));
    });
  });
});
