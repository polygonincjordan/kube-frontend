import { AbstractControl } from '@angular/forms';
import { formatDate } from 'ngx-bootstrap/chronos';

/**
 * Rules for medication orders whose doses are scheduled per time (DEFTIM / DAILY).
 * The timing table (frequency-deftim) is the only place those doses are edited;
 * Quan mirrors the dose of its first row and Dosdef lists every row as "dose(HH:mm)".
 */
export const TIMED_FREQUENCIES = ['DEFTIM', 'DAILY'];

/** Dosdef starts with this entry when no dose is scheduled at 08:00. */
const MISSING_08_00 = '0(08:00)';

export function isTimedFrequency(frequencyList: any[], cycleKey: any): boolean {
  const frequency = (frequencyList || []).find(d => d.CycleKey == cycleKey);
  return !!frequency && TIMED_FREQUENCIES.includes(frequency.N1id);
}

/** A known frequency without a timing table, so a Dosdef left from DEFTIM / DAILY must not be sent. */
export function isUntimedFrequency(frequencyList: any[], cycleKey: any): boolean {
  const frequency = (frequencyList || []).find(d => d.CycleKey == cycleKey);
  return !!frequency && !TIMED_FREQUENCIES.includes(frequency.N1id);
}

/** Empty is missing; 0 is a dose. */
export function isMissingDose(dose: any): boolean {
  return dose === '' || dose === null || dose === undefined;
}

/** The first row's dose as entered (fractions kept); a missing dose stays empty. */
export function firstScheduledDose(rows: any[]): any {
  const dose = rows && rows.length ? rows[0].deftimDose : '';
  return isMissingDose(dose) ? '' : dose;
}

export function scheduledTime(time: any): string {
  return isMissingTime(time) ? '' : formatDate(new Date(time), 'HH:mm');
}

function isMissingTime(time: any): boolean {
  return time === '' || time === null || time === undefined || isNaN(new Date(time).getTime());
}

/** Splits Dosdef into its scheduled doses, leaving out the 08:00 entry that only fills the format. */
export function parseDosdef(dosdef: string): { dose: string; time: string }[] {
  const entries = (dosdef ? dosdef.split('-') : [])
    .map(element => ({ element, match: element.match(/\(([^)]+)\)/) }))
    .filter(d => d.match && d.match[1])
    .map(d => ({ element: d.element, dose: d.element.split('(')[0], time: d.match[1] }));
  if (entries.length > 1 && entries[0].element === MISSING_08_00 && !entries.slice(1).some(d => d.time === '08:00')) {
    entries.shift();
  }
  return entries.map(({ dose, time }) => ({ dose, time }));
}

/** The timing rows for a DEFTIM / DAILY order: its saved Dosdef, or one 08:00 row with the entered dose. */
export function timedScheduleRows(order: any): any[] {
  const unit = order.Quanunit?.Meinh ? order.Quanunit.Meinh : order.Quanunit;
  const today = formatDate(new Date(), 'YYYY-MM-DD');
  const saved = parseDosdef(order.Dosdef);
  const doses = saved.length ? saved : [{ dose: order.Quan, time: '08:00' }];
  return doses.map(({ dose, time }) => ({ deftimDose: dose, deftimDosageUnit: unit, deftimTime: new Date(`${today}T${time}`), Agentid: order.Agentid }));
}

/** A new medicine's timing table: one 08:00 time without a dose, in the order's current unit. */
export function restartedTimedSchedule(order: any): any[] {
  return timedScheduleRows({ ...order, Dosdef: '', Quan: '' });
}

/** Dosdef for the timing rows, listing 08:00 as 0 when no dose is scheduled then. */
export function timedDosdef(rows: any[]): string {
  const doses = rows.map(row => `${row.deftimDose}(${scheduledTime(row.deftimTime)})`);
  return (rows.some(row => scheduledTime(row.deftimTime) === '08:00') ? doses : [MISSING_08_00, ...doses]).join('-');
}

/** Each timing row's missing Dose, Dosage Unit or Time, e.g. "row 2 (20:00): Dose". */
export function timedScheduleErrors(rows: any[]): string[] {
  if (!rows || !rows.length) { return ['add at least one dose time']; }
  return rows.map((row, i) => {
    const missing = [
      isMissingDose(row.deftimDose) ? 'Dose' : null,
      row.deftimDosageUnit ? null : 'Dosage Unit',
      isMissingTime(row.deftimTime) ? 'Time' : null,
    ].filter(Boolean);
    const time = scheduledTime(row.deftimTime);
    return missing.length ? `row ${i + 1}${time ? ` (${time})` : ''}: ${missing.join(', ')}` : null;
  }).filter(Boolean);
}

/**
 * The first touched DEFTIM / DAILY order whose timing table is incomplete, with a message that
 * names each missing Dose, Dosage Unit or Time; null when every timing table is complete.
 */
export function incompleteTimedSchedule(orders: AbstractControl[], frequencyList: any[],
  frequencyKey: (order: AbstractControl) => any = order => order.get('N1znr').value): { order: AbstractControl; text: string } | null {
  const incomplete = orders
    .map((order, index) => ({ order, index }))
    .filter(({ order }) => order.touched && isTimedFrequency(frequencyList, frequencyKey(order)))
    .map(({ order, index }) => ({ order, index, errors: timedScheduleErrors(order.get('deftimcycleData').value) }))
    .filter(d => d.errors.length);
  if (!incomplete.length) { return null; }
  const name = (d: { order: AbstractControl; index: number }) => (d.order.get('Result_Drug_Name') && d.order.get('Result_Drug_Name').value) || `Medication ${d.index + 1}`;
  return { order: incomplete[0].order, text: `Missing ${incomplete.map(d => `${name(d)}: ${d.errors.join('; ')}`).join(' | ')}` };
}

/**
 * The first touched order with a medicine but no dose outside a timing table, with a message
 * naming each such medicine; null when every entered medicine has a dose.
 */
export function missingDose(orders: AbstractControl[], frequencyList: any[],
  frequencyKey: (order: AbstractControl) => any = order => order.get('N1znr').value): { order: AbstractControl; text: string } | null {
  const missing = orders.filter(order => order.touched && order.get('Result_Drug_Name') && order.get('Result_Drug_Name').value
    && isMissingDose(order.get('Quan').value) && !isTimedFrequency(frequencyList, frequencyKey(order)));
  if (!missing.length) { return null; }
  return { order: missing[0], text: `Enter the dose for ${missing.map(order => order.get('Result_Drug_Name').value).join(', ')}` };
}
