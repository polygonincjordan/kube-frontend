import {
  parseNeonatalDate,
  toOptionalSapDate,
  toSapDateString,
} from './neonatal-disch-date.util';

describe('Neonatal Discharge dates', () => {
  describe('toOptionalSapDate', () => {
    it('sends null for an unticked UVC/UAC line instead of an empty string', () => {
      expect(toOptionalSapDate('')).toBeNull();
      expect(toOptionalSapDate(null)).toBeNull();
      expect(toOptionalSapDate(undefined)).toBeNull();
    });

    it('formats a ticked line date for SAP', () => {
      expect(toOptionalSapDate(new Date(2026, 9, 22, 13, 15))).toBe(
        '2026-10-22T00:00:00'
      );
      expect(toOptionalSapDate('22-10-2026')).toBe('2026-10-22T00:00:00');
    });
  });

  describe('toSapDateString', () => {
    it('keeps the existing format for required dates', () => {
      expect(toSapDateString(new Date(2025, 6, 11))).toBe('2025-07-11T00:00:00');
    });
  });

  describe('parseNeonatalDate', () => {
    it('parses the SAP OData epoch form', () => {
      const ms = new Date(2026, 9, 22).getTime();
      expect(parseNeonatalDate(`/Date(${ms})/`)?.getTime()).toBe(ms);
      expect(parseNeonatalDate(`/Date(${ms}+0180)/`)?.getTime()).toBe(ms);
    });

    it('reads an ISO date as the stored calendar day', () => {
      const date = parseNeonatalDate('2026-10-22T00:00:00');
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(9);
      expect(date?.getDate()).toBe(22);
    });

    it('returns null for empty values and the SAP empty date', () => {
      expect(parseNeonatalDate('')).toBeNull();
      expect(parseNeonatalDate(null)).toBeNull();
      expect(parseNeonatalDate('0000-00-00T00:00:00')).toBeNull();
    });

    it('keeps a picker Date as it is', () => {
      const date = new Date(2026, 9, 22);
      expect(parseNeonatalDate(date)).toBe(date);
    });
  });
});
