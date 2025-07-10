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
  public gender = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' },
    { value: '3', label: 'UnKnown' }
  ]
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
    this.initForm();

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
      this.addDrain('', i)
    }

    this.getPatientDeliveryDetails();
  }

  getPatientDeliveryDetails() {
    this.emergencyService
      .fetchPatientDeliveryDetail(this.paramsObject.falnr)
      .subscribe((response: any) => {
        const deliveryDetails = response?.d?.results[0];
        const neonatalArray = deliveryDetails.TOPATDEL.results || [];

        const formArray = this.TONEONATAL;
        formArray.clear();

        // Loop and add each neonatal entry
        neonatalArray.forEach((item, index) => {
          const convertedItem = {
            Dockey: deliveryDetails.Faln1,
            Noo: (index + 1).toString(),
            Timee: item.Gbtim,
            Sex: item.Gschl,
            Wt: item.Gbgew,
            ApgarScore1: item.Bwert,
            ApgarScore5: item.Bwert5,
            ApgarScore10: item.Bwert10,
            StatusDesc: ''
          };
          this.addDrain(convertedItem, index);
        });
      });
  }

  get TONEONATAL(): FormArray {
    return this.deliveryRecordeForm.get('TONEONATAL') as FormArray;
  }

  addDrain(item?, index?) {
    const drainGroup = this.formBuilder.group({
      Dockey: [item?.Dockey ?? ''],
      Noo: [item?.Noo ?? (this.TONEONATAL.length + 1).toString()],
      Timee: [this.parseTime(item?.Timee) ?? this.currentTime],
      Sex: [item?.Sex ?? ''],
      Wt: [item?.Wt ?? ''],
      ApgarScore1: [item?.ApgarScore1 ?? ''],
      ApgarScore5: [item?.ApgarScore5 ?? ''],
      ApgarScore10: [item?.ApgarScore10 ?? ''],
      StatusDesc: [item?.StatusDesc ?? '']
    });

    this.TONEONATAL.push(drainGroup);
  }

  isOtherChecked(): boolean {
    return (
      this.deliveryRecordeForm.get('LsContraction')?.value ||
      this.deliveryRecordeForm.get('LsBleeding')?.value ||
      this.deliveryRecordeForm.get('LsRupture')?.value ||
      this.deliveryRecordeForm.get('LsOther')?.value
    );
  }

  // When "None" is checked
  onNoneChange(): void {
    if (this.deliveryRecordeForm.get('LsNone')?.value) {
      this.deliveryRecordeForm.patchValue({
        LsContraction: false,
        LsBleeding: false,
        LsRupture: false,
        LsOther: false,
        LsOtherTxt: ''
      });
    }
  }

  // When any other checkbox is checked
  onOtherChange(): void {
    if (this.isOtherChecked()) {
      this.deliveryRecordeForm.get('LsNone')?.setValue(false);
    }
  }

  onAnesthesiaChange(selected: string): void {
    const controls = ['TsAtNone', 'TsAtLocal', 'TsAtGeneral', 'TsAtEpidural', 'TsAtOther'];
    controls.forEach(ctrl => {
      if (ctrl !== selected) {
        this.deliveryRecordeForm.get(ctrl)?.setValue(false, { emitEvent: false });
      }
    });
  }

  setupLaborSignsLogic(): void {
    // Watch for changes to "None"
    this.deliveryRecordeForm.get('LsNone')?.valueChanges.subscribe((noneSelected: boolean) => {
      if (noneSelected) {
        this.deliveryRecordeForm.get('LsContraction')?.disable();
        this.deliveryRecordeForm.get('LsBleeding')?.disable();
        this.deliveryRecordeForm.get('LsRupture')?.disable();
        this.deliveryRecordeForm.get('LsOther')?.disable();
        this.deliveryRecordeForm.get('LsOtherTxt')?.disable();
      } else {
        this.deliveryRecordeForm.get('LsContraction')?.enable();
        this.deliveryRecordeForm.get('LsBleeding')?.enable();
        this.deliveryRecordeForm.get('LsRupture')?.enable();
        this.deliveryRecordeForm.get('LsOther')?.enable();
        this.deliveryRecordeForm.get('LsOtherTxt')?.enable();
      }
    });

    // Watch for other checkboxes
    ['LsContraction', 'LsBleeding', 'LsRupture', 'LsOther'].forEach(controlName => {
      this.deliveryRecordeForm.get(controlName)?.valueChanges.subscribe(() => {
        const anyOtherChecked = ['LsContraction', 'LsBleeding', 'LsRupture', 'LsOther']
          .some(name => this.deliveryRecordeForm.get(name)?.value);
        if (anyOtherChecked) {
          this.deliveryRecordeForm.get('LsNone')?.disable();
        } else {
          this.deliveryRecordeForm.get('LsNone')?.enable();
        }
      });
    });
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
    this.subscription = this.emergencyService.fetchDeliveryRecordDoc(docKey).subscribe({
      next: (apiResponse: any) => {
        const data = apiResponse?.d?.results[0] || {};
        const deliveryDate = data.DeliveryDate
          ? new Date(parseInt(data.DeliveryDate.replace('/Date(', '').replace(')/', ''), 10))
          : null;

        // Convert PT14H09M01S → 14:09 or keep as-is depending on your need
        const deliveryHour = data.DeliveryHour
          ? data.DeliveryHour.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '').slice(0, 5)
          : '';
        this.deliveryRecordeForm.patchValue({
          Dockey: data.Dockey,
          Dtid: data.Dtid,
          Einri: data.Einri,
          Patnr: data.Patnr,
          Falnr: data.Falnr,
          Lfdnr: data.Lfdnr,
          Orgdo: this.storageService.patientData.deptOrgUnit,
          AttendPhy: this.storageService.getUserProfile().Gpart,
          DocStatus: data.DocStatus,
          AttendDoctor: data.AttendDoctor,
          AttendMidwife: data.AttendMidwife,
          DeliveryDate: deliveryDate,
          DeliveryHour: this.parseTime(data.DeliveryHour),

          LsNone: data.LsNone,
          LsContraction: data.LsContraction,
          LsBleeding: data.LsBleeding,
          LsRupture: data.LsRupture,
          LsOther: data.LsOther,
          LsOtherTxt: data.LsOtherTxt,

          FsApproximate: data.FsApproximate,
          FsApproximateTxt: data.FsApproximateTxt,
          FsSpontaneous: data.FsSpontaneous,
          FsSpontaneousTxt: data.FsSpontaneousTxt,
          FsInduced: data.FsInduced,
          FsAmniotomy: data.FsAmniotomy,
          FsOxytocin: data.FsOxytocin,
          FsProstin: data.FsProstin,
          FsOther: data.FsOther,
          FsRemarks: data.FsRemarks,

          SsDuration: data.SsDuration,
          SsDurationTxt: data.SsDurationTxt,
          SsNormal: data.SsNormal,
          SsNormalTxt: data.SsNormalTxt,
          SsForceps: data.SsForceps,
          SsForcepsLow: data.SsForcepsLow,
          SsForcepsMild: data.SsForcepsMild,
          SsForcepsDur: data.SsForcepsDur,
          SsEpisiotomy: data.SsEpisiotomy,
          SsMidline: data.SsMidline,
          SsMediolateral: data.SsMediolateral,
          SsLaceration: data.SsLaceration,
          SsLacCervix: data.SsLacCervix,
          SsLacVagina: data.SsLacVagina,
          SsLacPerineum: data.SsLacPerineum,
          SsPresent: data.SsPresent,
          SsPresentA: data.SsPresentA,
          SsPresentATxt: data.SsPresentATxt,
          SsPresentB: data.SsPresentB,
          SsPresentBTxt: data.SsPresentBTxt,
          SsRemarks: data.SsRemarks,

          TsDuration: data.TsDuration,
          TsDurationTxt: data.TsDurationTxt,
          TsPlacenta: data.TsPlacenta,
          TsPlacentaTxt: data.TsPlacentaTxt,
          TsExpressed: data.TsExpressed,
          TsExpressedTxt: data.TsExpressedTxt,
          TsManual: data.TsManual,
          TsManualTxt: data.TsManualTxt,
          TsRemarks: data.TsRemarks,
          TsEstimated: data.TsEstimated,
          TsEstimatedTxt: data.TsEstimatedTxt,
          TsInfusion: data.TsInfusion,
          TsIType: data.TsIType,
          TsIAmount: data.TsIAmount,
          TsTransfusion: data.TsTransfusion,
          TsTType: data.TsTType,
          TsTAmount: data.TsTAmount,
          TsMaternalCond: data.TsMaternalCond,

          TsAtNone: data.TsAtNone,
          TsAtLocal: data.TsAtLocal,
          TsAtGeneral: data.TsAtGeneral,
          TsAtEpidural: data.TsAtEpidural,
          TsAtOther: data.TsAtOther,
          TsAtOtherTxt: data.TsAtOtherTxt,

          TsAsyphyxiated: data.TsAsyphyxiated,
          TsAsyphyxiatedTxt: data.TsAsyphyxiatedTxt
        });

        // this.deliveryRecordeForm.patchValue({
        //   DeliveryDate: this.getDate(payload.DeliveryDate),
        //   DeliveryHour: this.parseTime(payload.DeliveryHour),
        // });
        // this.deliveryRecordeForm.patchValue(data);
        if (data.TONEONATAL.results.length) {
          (this.deliveryRecordeForm.get('TONEONATAL') as FormArray).clear();
          data.TONEONATAL.results.forEach((group, i) => this.addDrain(group, i));
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
      formData.DocStatus = status;
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
          this.sharedService.waringSwallModel(`PUT Error at Delivery Record : ${err}`);
        },
        complete: () => {
          resolve(true);
          if (status === 'edit') {
            this.sharedService.successSwallModel('Delivery Record updated successfully');
          } else {
            this.sharedService.successSwallModel('Delivery Record created successfully');
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
    console.log(data, "---")
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data && data.length === 8) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }


}
