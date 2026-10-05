import { formatDate } from '@angular/common';

/**
 * Builds the Excel export of the emergency dashboard's ER completed list. The
 * columns follow the list's data columns; Risk, Allergy and Vitals are
 * icon-only indicators in the list and are not exported.
 */
export const ER_HISTORY_EXPORT_HEADING = [
  'Patient Name',
  'MRN',
  'Case#',
  'Date',
  'Time',
  'Triage',
  'Room',
  'Status',
  'Financial Cat.',
  'Assigned physician',
  'Diagnosis',
  'Waiting Time',
];

/** SAP sends dates as `/Date(<ms>)/`; shown as `dd.MM.yyyy` like the list. */
export function formatErHistoryDate(value: string): string {
  const ms = parseInt(String(value || '').replace(/[^0-9]/g, ''), 10);
  return isNaN(ms) ? '' : formatDate(new Date(ms), 'dd.MM.y', 'en-US');
}

/** SAP sends times as `PT09H27M00S`; shown as `HH:mm` like the list. */
export function formatErHistoryTime(value: string): string {
  const match = /^PT(\d{1,2})H(\d{1,2})M/.exec(String(value || ''));
  return match ? `${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}` : '';
}

/** One row per displayed visit, in heading order. */
export function buildErHistoryExportRows(visits: any[]): any[][] {
  return (visits || []).map((visit) => [
    visit.Patient,
    visit.Patnr,
    visit.Falnr,
    formatErHistoryDate(visit.Datum),
    formatErHistoryTime(visit.ZeitIntern),
    visit.TriagePriorityCode,
    visit.BehraumKb,
    visit.StatusTxt,
    visit.ZzfinCat,
    visit.Behpersname,
    visit.Diagnosis,
    visit.assignedTime,
  ]);
}
