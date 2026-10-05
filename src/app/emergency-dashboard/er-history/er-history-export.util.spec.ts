import {
  buildErHistoryExportRows,
  ER_HISTORY_EXPORT_HEADING,
  formatErHistoryDate,
  formatErHistoryTime,
} from './er-history-export.util';

/** A checked-out visit as returned by the ER list service (synthetic data). */
function visit(overrides: any = {}): any {
  return {
    Patient: 'Test Patient',
    Patnr: '0000123456',
    Falnr: '0000987654',
    // 5 Oct 2026 12:00 UTC, so the date is the same in any time zone.
    Datum: '/Date(1791201600000)/',
    ZeitIntern: 'PT09H27M00S',
    TriagePriorityCode: '3',
    BehraumKb: 'Treat. Box 8',
    StatusTxt: 'Checked Out',
    ZzfinCat: 'Insurance',
    Behpersname: 'Test Physician',
    Diagnosis: 'Muscle spasm',
    assignedTime: '00h06',
    ...overrides,
  };
}

describe('ER history Excel export', () => {
  it('exports one row per visit with values under their matching headings', () => {
    const rows = buildErHistoryExportRows([visit(), visit({ Patient: 'Second Patient' })]);

    expect(rows.length).toBe(2);
    expect(rows[0].length).toBe(ER_HISTORY_EXPORT_HEADING.length);
    const exported: any = {};
    ER_HISTORY_EXPORT_HEADING.forEach((heading, i) => (exported[heading] = rows[0][i]));
    expect(exported).toEqual({
      'Patient Name': 'Test Patient',
      'MRN': '0000123456',
      'Case#': '0000987654',
      'Date': '05.10.2026',
      'Time': '09:27',
      'Triage': '3',
      'Room': 'Treat. Box 8',
      'Status': 'Checked Out',
      'Financial Cat.': 'Insurance',
      'Assigned physician': 'Test Physician',
      'Diagnosis': 'Muscle spasm',
      'Waiting Time': '00h06',
    });
    expect(rows[1][0]).toBe('Second Patient');
  });

  it('exports no rows for an empty or missing list', () => {
    expect(buildErHistoryExportRows([])).toEqual([]);
    expect(buildErHistoryExportRows(null)).toEqual([]);
  });

  it('leaves missing SAP dates and times blank instead of failing', () => {
    expect(formatErHistoryDate('')).toBe('');
    expect(formatErHistoryDate(undefined)).toBe('');
    expect(formatErHistoryTime('')).toBe('');
    expect(formatErHistoryTime(null)).toBe('');
  });
});
