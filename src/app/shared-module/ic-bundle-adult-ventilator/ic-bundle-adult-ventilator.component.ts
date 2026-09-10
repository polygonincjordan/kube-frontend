import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ic-bundle-adult-ventilator',
  templateUrl: './ic-bundle-adult-ventilator.component.html',
  styleUrls: ['./ic-bundle-adult-ventilator.component.scss']
})
export class IcBundleAdultVentilatorComponent implements OnInit, OnDestroy {
  @Output() cancelEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();

  public avapForm: FormGroup;
  public paramsObject: any;
  public docKey: any;
  public loadErrorMessage: string = '';
  public saveAttempted: boolean = false;

  // The one-character Yes/No/N/A encoding this document family uses.
  public readonly YES = '0';
  public readonly NO = '1';
  public readonly NOT_APPLICABLE = '2';

  public readonly bundles = [
    { field: 'Bundle1', text: '1. Head of the bed elevated to between 30 and 45 degrees' },
    { field: 'Bundle2', text: '2. Daily "sedation interruption" and daily assessment of readiness to extubate performed?' },
    { field: 'Bundle3', text: '3. Peptic ulcer disease (PUD) prophylaxis prescribed according to policy?' },
    { field: 'Bundle4', text: '4. Deep venous thrombosis (DVT) prophylaxis measures (unless contraindicated) prescribed according to policy?' },
    { field: 'Bundle5', text: '5. Daily oral care provided: 0.12% oral chlorhexidine for use as mouth rinse?' }
  ];

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    public storageService: StorageService,
    public admissionService: AdmissionService,
    private dataShareService: DataShareService,
    private sharedService: SharedService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
    });

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Add$ && data.value == '') {
          this.docKey = data.value.Dockey;
        }
        if (data.type == ActionType.Update$ && data.value) {
          this.docKey = data.value.docKey;
          this.getDocument();
        }
        if (data.type == ActionType.Copy$ && data.value) {
          this.docKey = data.value.docKey;
          this.getDocument();
        }
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

  getDocument() {
    this.loadErrorMessage = '';
    this.subscription = this.admissionService.getAvapDetail(this.docKey).subscribe({
      next: (data: any) => {
        const document = data?.results ? data.results[0] : null;
        if (document) {
          this.initForm(document);
        } else {
          this.initForm();
          this.loadErrorMessage = 'This document could not be found. A blank form is shown instead.';
        }
      },
      error: () => {
        this.initForm();
        this.loadErrorMessage = 'This document could not be loaded. A blank form is shown instead.';
      }
    });
  }

  initForm(data?) {
    this.avapForm = this.formBuilder.group({
      DaysSinceAdmission: [data?.DaysSinceAdmission || ''],
      Location: [data?.Location || ''],
      MechVentStartDate: [this.getDate(data?.MechVentStartDate) || null, Validators.required],
      MechVentStartTime: [this.parseTime(data?.MechVentStartTime) || null, Validators.required],
      IntubationDate: [this.getDate(data?.IntubationDate) || null],
      VapBundleDate: [this.getDate(data?.VapBundleDate) || null],
      VentilatorDays: [data?.VentilatorDays || ''],
      Bundle1: [this.bundleValue(data?.Bundle1)],
      Bundle1NaReason: [data?.Bundle1NaReason || ''],
      Bundle2: [this.bundleValue(data?.Bundle2)],
      Bundle2NaReason: [data?.Bundle2NaReason || ''],
      Bundle3: [this.bundleValue(data?.Bundle3)],
      Bundle3NaReason: [data?.Bundle3NaReason || ''],
      Bundle4: [this.bundleValue(data?.Bundle4)],
      Bundle4NaReason: [data?.Bundle4NaReason || ''],
      Bundle5: [this.bundleValue(data?.Bundle5)],
      Bundle5NaReason: [data?.Bundle5NaReason || ''],
      VapPreventionScore: [''],
      Comments: [data?.Comments || '']
    });

    this.bundles.forEach((bundle) => this.applyReasonValidator(bundle.field));
    this.recalculateScore();
  }

  // Not Applicable is the real default for an unanswered bundle, so its reason is
  // mandatory like any deliberate N/A. Documents stored earlier with an empty
  // value normalise to it so they validate the same way.
  private bundleValue(stored: any): string {
    return stored ? stored : this.NOT_APPLICABLE;
  }

  isAnswer(field: string, value: string): boolean {
    return this.avapForm.get(field)?.value === value;
  }

  // Gates the reason field: true for the default as well as a deliberate pick.
  isNotApplicable(field: string): boolean {
    return this.avapForm.get(field)?.value === this.NOT_APPLICABLE;
  }

  setAnswer(field: string, value: string): void {
    this.avapForm.get(field)?.setValue(value);
    if (value !== this.NOT_APPLICABLE) {
      this.avapForm.get(field + 'NaReason')?.setValue('');
    }
    this.applyReasonValidator(field);
    this.recalculateScore();
  }

  // A reason is required whenever the answer is Not Applicable, including the
  // default every bundle starts on.
  private applyReasonValidator(field: string): void {
    const reason = this.avapForm.get(field + 'NaReason');
    if (!reason) {
      return;
    }
    if (this.isNotApplicable(field)) {
      reason.setValidators([Validators.required]);
    } else {
      reason.clearValidators();
    }
    reason.updateValueAndValidity({ emitEvent: false });
  }

  // Yes and Not Applicable both count as compliant; only No scores nothing.
  // Anything else cannot reach here through the UI and is counted as 0 rather
  // than inflating the score.
  public scoreForAnswer(value: string): number {
    if (value === this.YES || value === this.NOT_APPLICABLE) {
      return 1;
    }
    return 0;
  }

  public recalculateScore(): void {
    const total = this.bundles.reduce(
      (sum, bundle) => sum + this.scoreForAnswer(this.avapForm.get(bundle.field)?.value),
      0
    );
    this.avapForm.get('VapPreventionScore')?.setValue(String(total));
  }

  // Errors stay hidden until the field is touched or a save has been attempted,
  // so a freshly opened document does not open covered in red.
  showError(field: string): boolean {
    const control = this.avapForm.get(field);
    return !!control && control.invalid && (control.touched || this.saveAttempted);
  }

  // Dockey empty creates; an existing Dockey with DocStatus 1 updates, 2
  // releases, 3 opens a new version. The operation is the pair, not the route.
  public createDoc(status?: any, actionType?: any) {
    return new Promise((resolve) => {
      this.saveAttempted = true;
      this.avapForm.markAllAsTouched();

      if (this.avapForm.invalid) {
        this.sharedService.waringSwallModel(
          'Please complete the required fields before saving this document.'
        );
        resolve(false);
        return;
      }

      const formData = { ...this.avapForm.value };
      formData.MechVentStartDate = this.dateToSapFormat(formData.MechVentStartDate);
      formData.IntubationDate = this.dateToSapFormat(formData.IntubationDate);
      formData.VapBundleDate = this.dateToSapFormat(formData.VapBundleDate);
      formData.MechVentStartTime = this.convertTimeToDuration(formData.MechVentStartTime);

      const payload = {
        ...formData,
        Dockey: actionType === 'edit' || actionType === 'copy' ? this.docKey : '',
        Dtid: 'ZMED_AVAP',
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        Falnr: this.paramsObject.falnr,
        Lfdnr: this.paramsObject.lfdnr,
        Orgdo: 'F21IUAMC',
        AttendPhy: this.storageService.getUserProfile()?.Gpart,
        DocStatus: status
      };

      this.subscription = this.admissionService.createAvapDoc(payload).subscribe({
        next: () => {},
        error: (err: any) => {
          this.sharedService.waringSwallModel(
            `Error at IC Bundle for Adult Ventilator Associated Pneumonia : ${err}`
          );
          resolve(false);
        },
        complete: () => {
          resolve(true);
          this.sharedService.successSwallModel(this.getSuccessMessage(status, actionType));
          this.successEvent.next(true);
        }
      });
    });
  }

  getSuccessMessage(status?: any, actionType?: any): string {
    if (status === '2' || status === '4' || status === '5') {
      return 'IC Bundle for Adult Ventilator Associated Pneumonia released successfully';
    }
    if (actionType === 'edit') {
      return 'IC Bundle for Adult Ventilator Associated Pneumonia updated successfully';
    }
    return 'IC Bundle for Adult Ventilator Associated Pneumonia created successfully';
  }

  // The service expects /Date(<ms>)/. Build the epoch from the local calendar
  // date so a datepicker value at local midnight cannot slip to the previous
  // day once it is expressed in UTC.
  public dateToSapFormat(value: any): string {
    if (!value) {
      return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return `/Date(${Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())})/`;
  }

  // Always pad to PT08H30M00S. parseTime only reads that fixed-width form, so an
  // unpadded PT8H30M00S would save fine and then fail to load back.
  public convertTimeToDuration(timeString: string): string {
    if (!timeString) {
      return '';
    }
    const parts = timeString.split(':').map(Number);
    const pad = (value: number) => String(isNaN(value) ? 0 : value).padStart(2, '0');
    return `PT${pad(parts[0])}H${pad(parts[1])}M${pad(parts[2])}S`;
  }

  onCancel(): void {
    this.cancelEvent.emit();
  }

  // SAP sends dates as /Date(<milliseconds>)/; strip everything but the digits.
  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  // SAP sends times as PT08H30M00S; the time input needs HH:mm:ss.
  public parseTime(data: string) {
    if (!data || data.length !== 11 || data[4] !== 'H' || data[7] !== 'M' || data[10] !== 'S') {
      return null;
    }

    const hours = parseInt(data.slice(2, 4), 10);
    const minutes = parseInt(data.slice(5, 7), 10);
    const seconds = parseInt(data.slice(8, 10), 10);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return null;
    }

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  restrictToNumeric(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode < 48 || charCode > 57) && charCode !== 46) {
      event.preventDefault();
    }
  }
}
