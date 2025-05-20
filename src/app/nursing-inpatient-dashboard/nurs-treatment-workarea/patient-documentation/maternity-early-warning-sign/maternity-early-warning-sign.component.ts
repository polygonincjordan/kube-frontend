import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-maternity-early-warning-sign',
  templateUrl: './maternity-early-warning-sign.component.html',
  styleUrls: ['./maternity-early-warning-sign.component.scss'],
})
export class MaternityEarlyWarningSignComponent implements OnInit {
  @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();
  public criticalForm: FormGroup;
  public paramsObject: any;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  public docKey: any;
  public facialList: any;
  public painList: any;
  public VocalizationList: any;
  public ventilationList: any;
  public musicList: any;
  public bodyList: any;
  public realized: any;
  public realizedDescription: any;
  public CurrentDateAndTime: Date = new Date();
  constructor(
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    public storageService: StorageService,
    public admissionService: AdmissionService,
    private sharedService: SharedService,
    private dataShareService: DataShareService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
    });
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getDocument(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getDocument(data.value.docKey);
          }
        } else {
          // for after code
        }
      }
    );
  }

  ngOnInit(): void {
    this.initForm();
    //  this.criticalForm.valueChanges.subscribe((value:any) => {
    //  this.calculateScore();
    // });
    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;
  }

  calculateScore() {
    const form = this.criticalForm.getRawValue();

    const fields = [
      'RespiratoryRate',
      'OxygenSaturation',
      'HeartRate',
      'SystolicBp',
      'DiastolicBp',
      'Temperature',
      'LevelConsciousness',
      'UrineOutput',
      'AmnioticFluid',
      'Lochia',
    ];

    let total = 0;

    for (const field of fields) {
      const value = Number(form[field]);
      if (!isNaN(value)) {
        total += value;
      }
    }

    // Update total score
    this.criticalForm.get('TotalScore')?.setValue(total, { emitEvent: false });

    // Determine description and recommendations
    let scoreDescription = '';
    let recommendations = '';

    if (total === 0 || total === 1) {
      scoreDescription = 'Low Level Response';
      recommendations = `• Perform the MEOWS assessment with every set of clinical observations as determined by patient's clinical condition.`;
    } else if (total === 2) {
      scoreDescription = 'Moderate Level Response';
      recommendations =
        '• Repeat MEOWS assessment in 30 minutes.\n' +
        '• Notify charge nurse.\n' +
        '• Notify Obstetric Hospitalist.\n' +
        '• Document Findings in the EMR.';
    } else if (total >= 3) {
      scoreDescription = 'High Level Response';
      recommendations =
        '• Continuous monitoring and document every 15 minutes.\n' +
        '• Notify charge nurse/supervisor.\n' +
        '• Activate Rapid Response Team (Obstetric).\n' +
        '• Notify responsible Consultant to attend.\n' +
        '• Document Findings in the EMR.';
    }

    this.criticalForm
      .get('ScoreDescription')
      ?.setValue(scoreDescription, { emitEvent: false });
    this.criticalForm
      .get('Recommendations')
      ?.setValue(recommendations, { emitEvent: false });
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

  getDocument(data?) {
    this.admissionService.getMewsSetDetail(this.docKey).subscribe({
      next: (data: any) => {
        if (data) {
          this.initForm(data?.results[0]);
        }
      },
      error: (err: any) => {},
    });
  }

  initForm(data?) {
    this.criticalForm = this.formBuilder.group({
      RespiratoryRate: [data?.RespiratoryRate || ''],
      OxygenSaturation: [data?.OxygenSaturation || ''],
      HeartRate: [data?.HeartRate || ''],
      SystolicBp: [data?.SystolicBp || ''],
      DiastolicBp: [data?.DiastolicBp || ''],
      Temperature: [data?.Temperature || ''],
      LevelConsciousness: [data?.LevelConsciousness || ''],
      UrineOutput: [data?.UrineOutput || ''],
      AmnioticFluid: [data?.AmnioticFluid || ''],
      Lochia: [data?.Lochia || ''],
      TotalScore: [data?.TotalScore || 0],
      ScoreDescription: [data?.ScoreDescription || ''],
      Recommendations: [data?.Recommendations || ''],
    });
  }

  public createDoc(status?: any, actionType?: any) {
    return new Promise((resolve, reject) => {
      let formData = this.criticalForm.value;
      let payload = {
        ...formData,
        Dockey:actionType === 'edit' || actionType === 'copy' ? this.docKey : '',
        Dtid: 'ZSCA_MEWS',
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        Falnr: this.paramsObject.falnr,
        Lfdnr: this.paramsObject.lfdnr,
        Orgdo: 'F21IUAMC',
        AttendPhy: this.storageService.getUserProfile().Gpart,
        DocStatus: status,
      };

      this.subscription = this.admissionService
        .createMewsSetDoc(payload)
        .subscribe({
          next: (data: any) => {},
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Maternity Early Warning Sign : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (status === 'edit') {
              this.sharedService.successSwallModel(
                'Maternity Early Warning Sign updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Maternity Early Warning Sign created successfully'
              );
            }
            this.successEvent.next(true);
          },
        });
    });
  }
}
