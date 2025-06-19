import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';
import { ActionType } from '@services/interfaces/common.enum';

@Component({
  selector: 'app-delivery-record-doc',
  templateUrl: './delivery-record-doc.component.html',
  styleUrls: ['./delivery-record-doc.component.scss']
})
export class DeliveryRecordDocComponent implements OnInit {

  deliveryRecordeForm: FormGroup;
  paramsObject: any;
  docKey: any;

  activeTab: string = 'firstStage';
  public CurrentDateAndTime: Date = new Date();
  status = [
    { value: '0', label: 'Normal' },
    { value: '1', label: 'Birth Defects' },
    { value: '2', label: 'Premature' },
    { value: '3', label: 'Post Mature' },
  ];
  currentTime: string;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;


  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, public storageService: StorageService, private sharedService: SharedService,
    private emergencyService: EmergencyService, private dataShareService: DataShareService) {

    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Add$ && data.value == '') {
          this.docKey = data.value.Dockey
        }
        if (data.type == ActionType.Update$ && data.value) {
          this.docKey = data.value.docKey
          this.getNurseDocDetail(data.value.docKey)
        }
        if (data.type == ActionType.Copy$ && data.value) {
          this.docKey = data.value.docKey
          this.getNurseDocDetail(data.value.docKey)
        }
      } else if (data.type == ActionType.Copy$ && data.value) {
        this.docKey = data.value.docKey
        this.getNurseDocDetail(data.value.docKey)
      } else {
        // for after code
      }
    })
  }

  ngOnInit(): void {
    this.initForm();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  initForm() {

    this.deliveryRecordeForm = this.formBuilder.group({
      Dockey: [''],
      Dtid: ['ZMED_DELRD'],
      Einri: [this.paramsObject.einri],
      Patnr: [this.paramsObject.patnr],
      Falnr: [this.paramsObject.falnr],
      Lfdnr: [this.paramsObject.lfdnr],
      Orgdo: [this.storageService.patientData.deptOrgUnit],
      AttendPhy: [this.storageService.getUserProfile().Gpart],
      DocStatus: ['1'],
      AttendDoctor: [''],
      AttendMidwife: [''],
      DeliveryDate: [new Date()],
      DeliveryHour: [this.currentTime],

      // Labor signs
      LsNone: [false],
      LsContraction: [false],
      LsBleeding: [false],
      LsRupture: [false],
      LsOther: [false],
      LsOtherTxt: [''],

      // First Stage
      FsApproximate: [false],
      FsApproximateTxt: [''],
      FsSpontaneous: [false],
      FsSpontaneousTxt: [''],
      FsInduced: [false],
      FsAmniotomy: [''],
      FsOxytocin: [''],
      FsProstin: [''],
      FsOther: [''],
      FsRemarks: [''],

      // Second Stage
      SsDuration: [false],
      SsDurationTxt: [''],
      SsNormal: [false],
      SsNormalTxt: [''],
      SsForceps: [false],
      SsForcepsLow: [''],
      SsForcepsMild: [''],
      SsForcepsDur: [''],
      SsEpisiotomy: [false],
      SsMidline: [false],
      SsMediolateral: [false],
      SsLaceration: [false],
      SsLacCervix: [''],
      SsLacVagina: [''],
      SsLacPerineum: [''],
      SsPresent: [false],
      SsPresentA: [false],
      SsPresentATxt: [''],
      SsPresentB: [false],
      SsPresentBTxt: [''],
      SsRemarks: [''],

      // Third Stage
      TsDuration: [false],
      TsDurationTxt: [''],
      TsPlacenta: [false],
      TsPlacentaTxt: [''],
      TsExpressed: [false],
      TsExpressedTxt: [''],
      TsManual: [false],
      TsManualTxt: [''],
      TsRemarks: [''],
      TsEstimated: [false],
      TsEstimatedTxt: [''],
      TsInfusion: [false],
      TsIType: [''],
      TsIAmount: [''],
      TsTransfusion: [false],
      TsTType: [''],
      TsTAmount: [''],
      TsMaternalCond: [''],

      // Anesthesia
      TsAtNone: [false],
      TsAtLocal: [false],
      TsAtGeneral: [false],
      TsAtEpidural: [false],
      TsAtOther: [false],
      TsAtOtherTxt: [''],

      // Asphyxiation
      TsAsyphyxiated: [false],
      TsAsyphyxiatedTxt: [''],

      TONEONATAL: this.formBuilder.array([]),

    });

    for (let i = 0; i < 5; i++) {
      this.addDrain()
    }
  }

  get TONEONATAL(): FormArray {
    return this.deliveryRecordeForm.get('TONEONATAL') as FormArray;
  }

  addDrain(item?) {
    const drainGroup = this.formBuilder.group({
      Dockey: [''],
      Noo: [''],
      Timee: [''],
      Sex: [''],
      Wt: [''],
      ApgarScore1: [''],
      ApgarScore5: [''],
      ApgarScore10: [''],
      StatusDesc: ['']
    });

    this.TONEONATAL.push(drainGroup);
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


  getNurseDocDetail(docKey?: any) {
    this.subscription = this.emergencyService.fetchPostCareRecord(docKey).subscribe({
      next: (apiResponse: any) => {
        const payload = apiResponse?.d?.results?.[0] || {};

        this.deliveryRecordeForm.patchValue(payload);
        if (payload.TONEONATAL.results.length) {
          (this.deliveryRecordeForm.get('TONEONATAL') as FormArray).clear();
          payload.TONEONATAL.results.forEach(group => this.addDrain(group));
        }

      },
      error: (err: any) => {
        this.sharedService.waringSwallModel(`Error ${err}`);
        this.sharedService.waringSwallModel(`POST Error at Delivery Record : ${err}`);
      },
    });
  }

  public createDeliveryRecordDoc(status?: any, actionType?: any) {
    return new Promise((resolve, reject) => {
      let formData = this.deliveryRecordeForm.value;
      formData.DeliveryDate = this.sanitizeSAPDateFormat(formData.DeliveryDate);
      formData.DeliveryHour = formData.DeliveryHour ? this.parsePayloadFormateTime(formData.DeliveryHour) : 'PT00H00M00S';
      formData['TONEONATAL'] = formData.TONEONATAL.filter(res => res.Wt).map(res => ({
        ...res,
        Timee: this.parsePayloadFormateTime(res.Timee)
      }));
      console.log(formData);
      this.subscription = this.emergencyService.saveDeliveryRecordDoc(formData).subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at Post Anesthesia Care Record : ${err}`);
        },
        complete: () => {
          resolve(true);
          if (status === 'edit') {
            this.sharedService.successSwallModel('Post Anesthesia Care Record updated successfully');
          } else {
            this.sharedService.successSwallModel('Post Anesthesia Care Record created successfully');
          }
          // this.successEvent.next(true)
        }
      });
    })
  }


  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  public parseTime(data: string) {
    // Check if data is valid and matches the expected format
    if (!data || data.length !== 11 || data[4] !== 'H' || data[7] !== 'M' || data[10] !== 'S') {
      return null;
    }

    // Extract hours, minutes, and seconds from the input string
    const hours = parseInt(data.slice(2, 4), 10);
    const minutes = parseInt(data.slice(5, 7), 10);
    const seconds = parseInt(data.slice(8, 10), 10);

    // Check if extracted values are valid numbers
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return null;
    }

    // Format hours, minutes, and seconds with leading zeros if necessary
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    // Construct the formatted time string
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    return null;
  }

  parseDate(date: string) {
    if (date) {
      if (new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"))) {
        return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
      }
    }
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data && data.length === 8) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }


}
