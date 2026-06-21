import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

/**
 * Cycle Definition popup.
 *
 * Lets a physician define one or more administration cycles (week-days, dates,
 * quantity and repeat interval) for a medication order. Each cycle is emitted as
 * a TOCYCDEF record that is sent inside the matching TOSTD item of the
 * EstdordSet payload.
 */
@Component({
  selector: 'cycle-definition-popup',
  templateUrl: './cycle-definition-popup.component.html',
  styleUrls: ['./cycle-definition-popup.component.scss']
})
export class CycleDefinitionPopupComponent {

  private modalRef: BsModalRef;

  /** Index of the medication row this cycle definition belongs to. */
  public rowIndex: number;
  /** Frequency cycle key (N1znr) of the medication order. */
  public n1znr: string;
  /** Title shown in the popup header, e.g. the drug description. */
  public title: string;

  public cycleForm: FormGroup;
  public activeTab = 0;

  @ViewChild('cycleDefinition', { static: true }) cycleDefinition: TemplateRef<any>;

  @Output() onSave: EventEmitter<{ index: number; data: any[] }> = new EventEmitter();

  constructor(private modalService: BsModalService, private fb: FormBuilder, private datePipe: DatePipe) {
    this.cycleForm = this.fb.group({ cycles: this.fb.array([]) });
  }

  get cycles(): FormArray {
    return this.cycleForm.get('cycles') as FormArray;
  }

  /**
   * Open the popup for a given medication row.
   * @param payload.index      row index in the drug array
   * @param payload.n1znr      frequency cycle key of the order
   * @param payload.title      header label (drug description / frequency text)
   * @param payload.startDate  order valid-from date used as the default From date
   * @param payload.records    previously saved TOCYCDEF records (read-back)
   */
  showPopup(payload: { index: number; n1znr: string; title?: string; startDate?: any; records?: any[] }): void {
    this.rowIndex = payload.index;
    this.n1znr = payload.n1znr;
    this.title = payload.title || '';
    this.cycles.clear();

    const records = payload.records && payload.records.length ? payload.records : null;
    if (records) {
      records.forEach(r => this.cycles.push(this.buildCycle(r)));
    } else {
      this.cycles.push(this.buildCycle({ Begdt: payload.startDate ? new Date(payload.startDate) : new Date() }));
    }
    this.activeTab = 0;
    this.modalRef = this.modalService.show(this.cycleDefinition, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'cycle-definition-modal'
    });
  }

  /** Build a single cycle form group, optionally hydrated from a saved record. */
  private buildCycle(record: any = {}): FormGroup {
    const begin = this.toDate(record.Begdt) || new Date();
    const group = this.fb.group({
      N1lfnr: [record.N1lfnr || ''],
      Menge: [record.Menge !== undefined && record.Menge !== null && record.Menge !== '' ? `${record.Menge}` : '1'],
      Begdt: [begin],
      // Default the end of the cycle to one month after the start, rather than the
      // open-ended 31.12.9999, so a new order has a sensible bounded span.
      Enddt: [this.toDate(record.Enddt) || this.addMonths(begin, 1)],
      everyDay: [record.IntervalDay !== undefined && +record.IntervalDay > 1 ? false : true],
      IntervalDay: [record.IntervalDay !== undefined && record.IntervalDay !== null ? +record.IntervalDay : 1],
      Mo: [this.toBool(record.Mo, true)],
      Tu: [this.toBool(record.Tu, true)],
      We: [this.toBool(record.We, true)],
      Th: [this.toBool(record.Th, true)],
      Fr: [this.toBool(record.Fr, true)],
      Sa: [this.toBool(record.Sa, true)],
      Su: [this.toBool(record.Su, true)],
      PublHol: [this.toBool(record.PublHol, true)],
      multipleDayFixedInterval: [false],
      // From/To time come back from SAP as ISO durations (e.g. PT05H00M00S).
      fromTime: [this.parseDuration(record.TiStart) || '09:00'],
      toTime: [this.parseDuration(record.TiEnd) || '09:00'],
      intervalMode: [record.IntervalMinute && +record.IntervalMinute > 0 ? 'minutes' : 'hours'],
      IntervalHour: [this.cleanNumber(record.IntervalHour, '24')],
      IntervalMinute: [record.IntervalMinute !== undefined && record.IntervalMinute !== null ? `${record.IntervalMinute}` : '0000']
    });
    this.keepEndDateValid(group);
    return group;
  }

  /**
   * Keep the To date sensible: whenever the From date moves to or past the To
   * date, push the To date to one month after the new From date.
   */
  private keepEndDateValid(group: FormGroup): void {
    group.get('Begdt').valueChanges.subscribe((value) => {
      const begin = this.toDate(value);
      const end = this.toDate(group.get('Enddt').value);
      if (begin && (!end || end <= begin)) {
        group.get('Enddt').setValue(this.addMonths(begin, 1), { emitEvent: false });
      }
    });
  }

  addCycle(): void {
    const nextLine = `${this.cycles.length + 1}`.padStart(4, '0');
    this.cycles.push(this.buildCycle({ Begdt: new Date(), N1lfnr: nextLine }));
    this.activeTab = this.cycles.length - 1;
  }

  removeCycle(i: number): void {
    if (this.cycles.length <= 1) { return; }
    this.cycles.removeAt(i);
    if (this.activeTab >= this.cycles.length) { this.activeTab = this.cycles.length - 1; }
  }

  selectTab(i: number): void {
    this.activeTab = i;
  }

  /**
   * Label shown on each cycle tab. Driven by the record's own N1lfnr (so tabs
   * reflect exactly what was received / saved), falling back to the 1-based
   * position for freshly added cycles that have no line number yet.
   */
  tabLabel(i: number): string {
    const group = this.cycles.at(i);
    const lfnr = group ? group.get('N1lfnr').value : null;
    return lfnr ? lfnr : `${i + 1}`.padStart(4, '0');
  }

  save(): void {
    const data = this.cycles.controls.map((group, i) => {
      const v = group.value;
      return {
        N1znr: this.n1znr,
        // Preserve the existing line number when editing; only generate one for new cycles.
        N1lfnr: v.N1lfnr || `${i + 1}`.padStart(4, '0'),
        Menge: `${v.Menge}`,
        Begdt: this.toSapDate(v.Begdt),
        Enddt: this.toSapDate(v.Enddt),
        Mo: !!v.Mo,
        Tu: !!v.Tu,
        We: !!v.We,
        Th: !!v.Th,
        Fr: !!v.Fr,
        Sa: !!v.Sa,
        Su: !!v.Su,
        IntervalDay: v.everyDay ? 1 : (+v.IntervalDay || 1),
        IntervalHour: `${this.cleanNumber(v.IntervalHour, '0')}`,
        TiStart: this.toDuration(v.fromTime),
        TiEnd: this.toDuration(v.toTime)
      };
    });
    this.onSave.emit({ index: this.rowIndex, data });
    this.modalRef.hide();
  }

  cancel(): void {
    this.modalRef.hide();
  }

  // ---- helpers -------------------------------------------------------------

  private toBool(value: any, fallback = false): boolean {
    if (value === undefined || value === null || value === '') { return fallback; }
    return value === true || value === 'true' || value === 'X' || value === 'x';
  }

  /** Format a Date as YYYY-MM-DDTHH:MM:SS (HH:MM:SS fixed to 00:00:00). */
  private toSapDate(value: any): string {
    const date = this.toDate(value);
    if (!date) { return null; }
    return `${this.datePipe.transform(date, 'yyyy-MM-dd')}T00:00:00`;
  }

  /** Parse a Date, an ISO string, or an OData /Date(ms)/ string into a Date. */
  private toDate(value: any): Date | null {
    if (!value) { return null; }
    if (value instanceof Date) { return value; }
    if (typeof value === 'string' && value.indexOf('/Date(') === 0) {
      const ms = parseInt(value.replace('/Date(', '').replace(')/', ''), 10);
      return isNaN(ms) ? null : new Date(ms);
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  /** Parse an ISO-8601 duration (e.g. "PT05H00M00S") into a "HH:mm" string. */
  private parseDuration(value: any): string {
    if (!value || typeof value !== 'string') { return ''; }
    const match = value.match(/PT(\d+)H(\d+)M/);
    if (!match) { return ''; }
    const hh = `${match[1]}`.padStart(2, '0');
    const mm = `${match[2]}`.padStart(2, '0');
    return `${hh}:${mm}`;
  }

  /** Convert a "HH:mm" string into an ISO-8601 duration ("PTxxHxxM00S"). */
  private toDuration(value: any): string {
    if (!value || typeof value !== 'string' || value.indexOf(':') < 0) { return 'PT00H00M00S'; }
    const [hh, mm] = value.split(':');
    return `PT${`${hh}`.padStart(2, '0')}H${`${mm}`.padStart(2, '0')}M00S`;
  }

  /** Normalise a numeric value that may arrive as "24.00" → "24"; falls back to the default. */
  private cleanNumber(value: any, fallback: string): string {
    if (value === undefined || value === null || value === '') { return fallback; }
    const n = parseFloat(value);
    return isNaN(n) ? fallback : `${n}`;
  }

  /** Return a new Date `months` after the given date (overflow rolls forward). */
  private addMonths(date: Date, months: number): Date {
    const result = new Date(date.getTime());
    result.setMonth(result.getMonth() + months);
    return result;
  }
}
