import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

/**
 * Cycle Definition popup.
 *
 * Lets a physician view/edit the administration cycle(s) of a medication order.
 * A frequency (N1znr) can have several cycle lines (N1lfnr 0001, 0002 …) — each
 * is shown as its own tab, driven by the data received (no manual "Add"). Each
 * cycle is emitted as a TOCYCDEF record inside the matching TOSTD item.
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
  /** Index of the currently visible cycle tab. */
  public activeTab = 0;

  public cycleForm: FormGroup;

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
   * @param payload.records    previously saved TOCYCDEF records (read-back) — only the first is used
   */
  showPopup(payload: { index: number; n1znr: string; title?: string; startDate?: any; records?: any[] }): void {
    this.rowIndex = payload.index;
    this.n1znr = payload.n1znr;
    this.title = payload.title || '';
    this.cycles.clear();

    // One tab per received cycle line (N1lfnr); if none, start with a single blank cycle.
    const records = payload.records && payload.records.length ? payload.records : null;
    if (records) {
      records.forEach(r => this.cycles.push(this.buildCycle(r)));
    } else {
      this.cycles.push(this.buildCycle({ Begdt: payload.startDate ? new Date(payload.startDate) : new Date(), N1lfnr: '0001' }));
    }
    this.activeTab = 0;

    this.modalRef = this.modalService.show(this.cycleDefinition, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'cycle-definition-modal'
    });
  }

  selectTab(i: number): void {
    this.activeTab = i;
  }

  /** Tab label = the record's own N1lfnr, falling back to the 1-based position. */
  tabLabel(i: number): string {
    const group = this.cycles.at(i);
    const lfnr = group ? group.get('N1lfnr').value : null;
    return lfnr ? lfnr : `${i + 1}`.padStart(4, '0');
  }

  /** Build the cycle form group, optionally hydrated from a saved record. */
  private buildCycle(record: any = {}): FormGroup {
    const r = this.normalizeIncoming(record);
    const begin = this.toDate(r.Begdt) || new Date();
    const group = this.fb.group({
      N1lfnr: [r.N1lfnr || ''],
      Menge: [r.Menge !== undefined && r.Menge !== null && r.Menge !== '' ? `${this.cleanNumber(r.Menge, '1')}` : '1'],
      Begdt: [begin],
      // Default the end of the cycle to one month after the start, rather than the
      // open-ended 31.12.9999, so a new order has a sensible bounded span.
      Enddt: [this.toDate(r.Enddt) || this.addMonths(begin, 1)],
      everyDay: [r.IntervalDay !== undefined && +r.IntervalDay > 1 ? false : true],
      IntervalDay: [r.IntervalDay !== undefined && r.IntervalDay !== null ? +r.IntervalDay : 1],
      Mo: [this.toBool(r.Mo, true)],
      Tu: [this.toBool(r.Tu, true)],
      We: [this.toBool(r.We, true)],
      Th: [this.toBool(r.Th, true)],
      Fr: [this.toBool(r.Fr, true)],
      Sa: [this.toBool(r.Sa, true)],
      Su: [this.toBool(r.Su, true)],
      PublHol: [this.toBool(r.PublHol, true)],
      multipleDayFixedInterval: [false],
      // From/To time come back from SAP as ISO durations (e.g. PT05H00M00S).
      fromTime: [this.parseDuration(r.TiStart) || '09:00'],
      toTime: [this.parseDuration(r.TiEnd) || '09:00'],
      intervalMode: [r.IntervalMinute && +r.IntervalMinute > 0 ? 'minutes' : 'hours'],
      IntervalHour: [this.cleanNumber(r.IntervalHour, '24')],
      IntervalMinute: [r.IntervalMinute !== undefined && r.IntervalMinute !== null ? `${r.IntervalMinute}` : '0000']
    });
    this.keepEndDateValid(group);
    return group;
  }

  /**
   * Map an incoming cycle record from any of the SAP shapes into one canonical
   * shape, so the popup works regardless of source:
   *  - CycleDef (CycleDefSet)        → N1mo/N1di/…, N1begzt/N1endzt, N1interH/N1interT, N1feiertag
   *  - CycleDefMaster                → Mo/Tu/…, TiStart/TiEnd, IntervalHour, IntervalMin, Holiday
   *  - TOCYCDEF (order/template)     → Mo/Tu/…, TiStart/TiEnd, IntervalHour, Begdt/Enddt, Menge
   */
  private normalizeIncoming(record: any): any {
    const rec = record || {};
    const pick = (...keys: string[]) => {
      for (const k of keys) { if (rec[k] !== undefined && rec[k] !== null) { return rec[k]; } }
      return undefined;
    };
    return {
      N1lfnr: rec.N1lfnr,
      Menge: pick('Menge'),
      Begdt: pick('Begdt'),
      Enddt: pick('Enddt'),
      IntervalDay: pick('IntervalDay', 'N1interT'),
      IntervalHour: pick('IntervalHour', 'N1interH'),
      IntervalMinute: pick('IntervalMinute', 'IntervalMin'),
      Mo: pick('Mo', 'N1mo'),
      Tu: pick('Tu', 'N1di'),
      We: pick('We', 'N1mi'),
      Th: pick('Th', 'N1do'),
      Fr: pick('Fr', 'N1fr'),
      Sa: pick('Sa', 'N1sa'),
      Su: pick('Su', 'N1so'),
      PublHol: pick('Holiday', 'PublHol', 'N1feiertag'),
      TiStart: pick('TiStart', 'TIStart', 'N1begzt'),
      TiEnd: pick('TiEnd', 'TIEnd', 'N1endzt')
    };
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

  save(): void {
    const data = this.cycles.controls.map((group, i) => {
      const v = group.value;
      return {
        N1znr: this.n1znr,
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

  /**
   * Serialize a date as OData V2 Edm.DateTime: "/Date(milliseconds)/" at UTC
   * midnight of the calendar day (Begdt/Enddt are Precision-0 dates). This is the
   * canonical wire format SAP Gateway expects on write and returns on read.
   */
  private toSapDate(value: any): string {
    const date = this.toDate(value);
    if (!date) { return null; }
    const ms = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return `/Date(${ms})/`;
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

  /**
   * Parse a SAP time value into "HH:mm" for the time input. Tolerant of every
   * shape we might receive: ISO duration ("PT05H00M00S"), TIMS "HHMMSS"
   * ("050000"), or "HH:MM[:SS]" ("05:00:00").
   */
  private parseDuration(value: any): string {
    if (!value || typeof value !== 'string') { return ''; }
    let m = value.match(/PT(\d+)H(\d+)M/);
    if (m) { return `${`${m[1]}`.padStart(2, '0')}:${`${m[2]}`.padStart(2, '0')}`; }
    m = value.match(/^(\d{2}):(\d{2})/);
    if (m) { return `${m[1]}:${m[2]}`; }
    m = value.match(/^(\d{2})(\d{2})\d{0,2}$/);
    if (m) { return `${m[1]}:${m[2]}`; }
    return '';
  }

  /**
   * Convert a "HH:mm" string into the SAP time format "HH:MM:SS" (8 chars, with
   * colons) that the TOCYCDEF TiStart/TiEnd properties expect on write.
   */
  private toDuration(value: any): string {
    if (!value || typeof value !== 'string' || value.indexOf(':') < 0) { return '00:00:00'; }
    const [hh, mm] = value.split(':');
    return `${`${hh}`.padStart(2, '0')}:${`${mm}`.padStart(2, '0')}:00`;
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
