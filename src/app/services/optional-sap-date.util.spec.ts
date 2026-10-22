import { optionalSapDate } from './optional-sap-date.util';

describe('optionalSapDate', () => {
  it('sends null for an empty date instead of an empty string', () => {
    expect(optionalSapDate('')).toBeNull();
    expect(optionalSapDate(null)).toBeNull();
    expect(optionalSapDate(undefined)).toBeNull();
  });

  it('does not call the formatter for an empty date', () => {
    const format = jasmine.createSpy('format');
    optionalSapDate('', format);
    expect(format).not.toHaveBeenCalled();
  });

  it('keeps a filled NICU date as already formatted', () => {
    expect(optionalSapDate('2026-10-22T00:00:00')).toBe('2026-10-22T00:00:00');
  });

  it('formats a filled Labor Room date with the given formatter', () => {
    const date = new Date(2026, 9, 22);
    const sanitize = (value: any) =>
      typeof value === 'string' ? value : `/Date(${value.getTime()})/`;
    expect(optionalSapDate(date, sanitize)).toBe(`/Date(${date.getTime()})/`);
    expect(optionalSapDate('/Date(1761091200000)/', sanitize)).toBe(
      '/Date(1761091200000)/'
    );
  });
});
