import {
  buildLabRadCancellationBlockedMessage,
  findProtectedLabRadItems,
  getItemServiceName,
  getMatchedProtectedStatus,
  isLabOrRadItem,
  isProtectedStatus,
  normalizeStatusText,
} from './clinical-order-cancellation-guard';

describe('clinical-order-cancellation-guard', () => {
  describe('normalizeStatusText', () => {
    it('lower-cases, collapses spaces/underscores/dashes and trims', () => {
      expect(normalizeStatusText('  Partially__Done  ')).toBe('partially done');
      expect(normalizeStatusText('PARTIALLY-DONE')).toBe('partially done');
      expect(normalizeStatusText(null)).toBe('');
      expect(normalizeStatusText(undefined)).toBe('');
    });
  });

  describe('isProtectedStatus', () => {
    it('matches performed / partially done / done / completed and variants', () => {
      ['Performed', 'performed', '  PERFORMED ', 'Result Performed'].forEach(
        (s) => expect(isProtectedStatus(s)).toBe(true)
      );
      ['Partially Done', 'partially  done', 'PARTIALLY-DONE'].forEach((s) =>
        expect(isProtectedStatus(s)).toBe(true)
      );
      ['Done', 'Sample Done', 'done'].forEach((s) =>
        expect(isProtectedStatus(s)).toBe(true)
      );
      ['Completed', 'Complete', 'COMPLETED'].forEach((s) =>
        expect(isProtectedStatus(s)).toBe(true)
      );
    });

    it('does not match non-performed or empty statuses', () => {
      ['Planned', 'Ordered', 'Requested', 'In Progress', '', null, undefined]
        .forEach((s) => expect(isProtectedStatus(s)).toBe(false));
    });

    it('does not match "done" as a substring inside another word', () => {
      expect(isProtectedStatus('Abandoned')).toBe(false);
    });
  });

  describe('isLabOrRadItem', () => {
    it('detects by type', () => {
      expect(isLabOrRadItem({ type: 'LAB' })).toBe(true);
      expect(isLabOrRadItem({ type: 'rad' })).toBe(true);
      expect(isLabOrRadItem({ type: 'MED' })).toBe(false);
      expect(isLabOrRadItem({ type: 'PROC' })).toBe(false);
    });

    it('detects by target collection', () => {
      expect(isLabOrRadItem({ targetCollection: 'TOLABSET' })).toBe(true);
      expect(isLabOrRadItem({ targetCollection: 'TORADSET' })).toBe(true);
      expect(isLabOrRadItem({ targetCollection: 'TOMEDICSET' })).toBe(false);
    });

    it('short-circuits when assumeLabOrRad is true', () => {
      expect(isLabOrRadItem({ type: 'MED' }, true)).toBe(true);
      expect(isLabOrRadItem(null, true)).toBe(true);
    });
  });

  describe('getMatchedProtectedStatus', () => {
    it('reads from any of the known status fields', () => {
      expect(getMatchedProtectedStatus({ Status: 'Performed' })).toBe('Performed');
      expect(getMatchedProtectedStatus({ Statustext: 'Done' })).toBe('Done');
      expect(getMatchedProtectedStatus({ Posstatus: 'Completed' })).toBe('Completed');
      expect(getMatchedProtectedStatus({ Lststatus: 'Partially Done' })).toBe(
        'Partially Done'
      );
    });

    it('reads from arbitrary result-status text fields', () => {
      expect(
        getMatchedProtectedStatus({ ResultStatusText: 'Performed' })
      ).toBe('Performed');
    });

    it('returns empty string when nothing is protected', () => {
      expect(getMatchedProtectedStatus({ Status: 'Planned' })).toBe('');
      expect(getMatchedProtectedStatus({})).toBe('');
    });
  });

  describe('getItemServiceName', () => {
    it('returns the first available service name field', () => {
      expect(getItemServiceName({ serviceDescr: 'CBC' })).toBe('CBC');
      expect(getItemServiceName({ Leitxt: 'X-Ray Chest' })).toBe('X-Ray Chest');
      expect(getItemServiceName({})).toBe('');
    });
  });

  describe('findProtectedLabRadItems', () => {
    it('returns protected lab/rad items with service name and status', () => {
      const items = [
        { type: 'LAB', serviceDescr: 'CBC', Status: 'Performed' },
        { type: 'RAD', serviceDescr: 'CT Head', Status: 'Planned' },
        { type: 'RAD', serviceDescr: 'MRI', Status: 'Done' },
      ];
      expect(findProtectedLabRadItems(items)).toEqual([
        { serviceName: 'CBC', status: 'Performed' },
        { serviceName: 'MRI', status: 'Done' },
      ]);
    });

    it('ignores non lab/rad items (Proc/Med/Surgery/Consultation)', () => {
      const items = [
        { type: 'MED', serviceDescr: 'Drug', Status: 'Performed' },
        { type: 'PROC', serviceDescr: 'Proc', Status: 'Completed' },
      ];
      expect(findProtectedLabRadItems(items)).toEqual([]);
    });

    it('uses assumeLabOrRad for profile flows without a type hint', () => {
      const items = [{ Leitxt: 'CBC', Status: 'Performed' }];
      expect(findProtectedLabRadItems(items)).toEqual([]);
      expect(findProtectedLabRadItems(items, true)).toEqual([
        { serviceName: 'CBC', status: 'Performed' },
      ]);
    });

    it('handles non-array / empty input', () => {
      expect(findProtectedLabRadItems(null as any)).toEqual([]);
      expect(findProtectedLabRadItems([])).toEqual([]);
    });
  });

  describe('buildLabRadCancellationBlockedMessage', () => {
    it('returns the base message when there are no protected items', () => {
      const msg = buildLabRadCancellationBlockedMessage([]);
      expect(msg).toContain('Cancellation is not allowed');
    });

    it('lists affected services and dedupes', () => {
      const msg = buildLabRadCancellationBlockedMessage([
        { serviceName: 'CBC', status: 'Performed' },
        { serviceName: 'CBC', status: 'Performed' },
        { serviceName: '', status: 'Done' },
      ]);
      expect(msg).toContain('CBC (Performed)');
      expect(msg).toContain('Done');
      // Deduped: CBC (Performed) appears only once.
      expect(msg.indexOf('CBC (Performed)')).toBe(msg.lastIndexOf('CBC (Performed)'));
    });
  });
});
