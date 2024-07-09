import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-nursing-discharge-summary',
  templateUrl: './nursing-discharge-summary.component.html',
  styleUrls: ['./nursing-discharge-summary.component.scss'],
})
export class NursingDischargeSummaryComponent implements OnInit, OnDestroy {
  selectedTabName: string = 'Discharge Plan';
  nursingDischargeForm: FormGroup;
  TODIAGNOSESFormArray: FormArray;

  tabLabelList = [
    'Discharge Plan',
    'Discharge Details',
    'Diagnosis',
    'Maternal Vaccination',
    'Environmental Safety',
  ];

  dischargeDropdownValue = [
    {
      label: 'N/A',
      value: '0',
    },
    {
      label: 'Yes',
      value: '1',
    },
    {
      label: 'No',
      value: '2',
    },
  ];

  modeOfDischargeValue = [
    {
      label: 'Car',
      value: '0',
    },
    {
      label: 'Ambulance',
      value: '1',
    },
    {
      label: 'Other',
      value: '2',
    },
  ];

  patientDischargeValue = [
    {
      label: 'Family',
      value: '0',
    },
    {
      label: 'Other',
      value: '1',
    },
  ];
  paramsObject: any;
  encounterId: any;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  diagnosisList: any = [];
  docKey: any;

  constructor(
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private storageService: StorageService,
    private patientService: PatientService,
    private dayCaseDashboard: DayCaseDashboardService,
    private sharedService: SharedService,
    private dataShareService: DataShareService,
    private datePipe: DatePipe,
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId =
          this.paramsObject.einri +
          this.paramsObject.falnr +
          this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
      this.getPatinetDetails(this.encounterId);
    });

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getNursingDischargeDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getNursingDischargeDocDetails(data.value.docKey);
          }
        }
      }
    );
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

  public getPatinetDetails(encounterId) {
    this.patientService
      .getDataPatient(encounterId)
      .pipe(
        catchError(() => {
          return of({} as Patient);
        })
      )
      .subscribe((patientData: Patient) => {
        this.storageService.setPatientData(patientData);
      });
  }

  getNursingDischargeDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .getNursingDischargeDocData(docKey)
      .subscribe({
        next: (data: any) => {

          this.nursingDischargeForm.patchValue(data.d.results[0]);
          this.nursingDischargeForm.patchValue({
            DischargeDate: this.parseDate(data.d.results[0].DischargeDate),
            MvDate: this.parseDate(data.d.results[0].MvDate),
            DischargeTime: this.parseTime(data.d.results[0].DischargeTime),
          })
          data.d.results[0].TODIAGNOSES.results.forEach(res =>{
            delete res.__metadata
          })
          this.diagnosisList = data.d.results[0].TODIAGNOSES.results;
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing discharge assessment: ${err}`
          );
        },
      });
  }

  ngOnInit(): void {
    this.initForm();
  }

  getDiagnosisData(event: any) {
    this.diagnosisList = event;
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), "hh:mm:ss");
    this.nursingDischargeForm = this.formBuilder.group({
      Dockey: '',
      Dtid: 'ZMED_NRDIS',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService.patientData.deptOrgUnit,
      DpMedicalFollow: '',
      DpDevices: '',
      DpAmbulance: '',
      DpTransfer: '',
      DpOthers: '',
      DischargeDate: new Date(),
      DischargeTime: currentTime,
      DiAdvice: '',
      DiWound: '',
      DiFundus: '',
      DiBreastCare: '',
      DiDischargeTo: '',
      DiPatientDeceased: '',
      DdMode: '',
      DdModeTxt: '',
      DdDischargedWith: '',
      DdDischargedWithTxt: '',
      DdDischargedAgainst: '',
      DdReason: '',
      DdDischargeSummary: '',
      DdDressingChanged: '',
      DdMedications: '',
      DdDevices: '',
      DdSupplies: '',
      DdProsthesis: '',
      DdRadiology: '',
      DdRelatedPatient: '',
      DdOutpatient: '',
      DdWhen: '',
      DdDischargeInstruct: '',
      MaternalVaccination: '',
      MvVaccine: '',
      MvBatch: '',
      MvAntiD: '',
      MvLotNo: '',
      MvDate: new Date(),
      EnvironmentalSafety: '',
      EnvironmentalAss: '',
      EsShower: false,
      EsTub: false,
      EsRefrigerator: false,
      EsCool: false,
      EsToilet: false,
      EsDoorway: false,
      EsStairs: false,
      EsOther: false,
      EsOtherTxt: '',
      AttendPhy: this.storageService.getUserProfile().Gpart,
      DocStatus: '',
    });
  }

  createNursingDischargeDoc(status: string, actiontype?: string) {
    return new Promise((resolve, reject) => {
      this.nursingDischargeForm.value.DocStatus = status;
      this.nursingDischargeForm.value.DischargeDate =
        this.sanitizeSAPDateFormat(
          this.nursingDischargeForm.value.DischargeDate
        );
      this.nursingDischargeForm.value.MvDate = this.sanitizeSAPDateFormat(
        this.nursingDischargeForm.value.MvDate
      );
      this.nursingDischargeForm.value.DischargeTime =
        this.parsePayloadFormateTime(
          this.nursingDischargeForm.value.DischargeTime
        );

      this.nursingDischargeForm.value.MvLotNo = parseInt(
        this.nursingDischargeForm.value.MvLotNo
      );

      this.nursingDischargeForm.value.TODIAGNOSES = this.diagnosisList;

      let paylaod = {
        d: this.nursingDischargeForm.value,
      };

      this.subscription = this.dayCaseDashboard
        .createNursingDischargeDoc(paylaod)
        .subscribe({
          next: (data: any) => {},
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Nursing care plan : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Nursing discharge summary updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Nursing discharge summary created successfully'
              );
            }
          },
        });
    });
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

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  switchTabs(tabName: string) {
    this.selectedTabName = tabName;
  }
  parseTime(data: string) {    
    if (data && data.length) {
      const strArr: string[] = data.split('');
      if (
        data &&
        data.length === 11 &&
        strArr[4] === 'H' &&
        strArr[7] === 'M' &&
        strArr[10] === 'S' &&
        !isNaN(+(strArr[2] + strArr[3])) &&
        !isNaN(+(strArr[5] + strArr[6])) &&
        !isNaN(+(strArr[8] + strArr[9]))
      ) {
        const hours =
          +(strArr[2] + strArr[3]) <= 9
            ? `0${+(strArr[2] + strArr[3])}`
            : +(strArr[2] + strArr[3]);
        const Minute =
          +(strArr[5] + strArr[6]) <= 9
            ? `0${+(strArr[5] + strArr[6])}`
            : +(strArr[5] + strArr[6]);
        const Second =
          +(strArr[8] + strArr[9]) <= 9
            ? `0${+(strArr[8] + strArr[9])}`
            : +(strArr[8] + strArr[9]);
        return `${hours}:${Minute}:${Second}`;
      }
    }
    return null;
  }

  parseDate(date: string) {
    if (date) {
      return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
    }
  }
}
