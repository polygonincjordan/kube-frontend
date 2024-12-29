import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { SurgeryTeamData } from '@services/e-kardex/interfaces/inpatient-data';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { UserConfigurationService } from '@services/e-kardex/user-configuration.service';
import { Subscription, catchError, of } from 'rxjs';
import { ConfigPopup } from 'src/app/core/config-popup/config-popup.component';

@UntilDestroy()
@Component({
  selector: 'app-operation-report',
  templateUrl: './operation-report.component.html',
  styleUrls: ['./operation-report.component.scss'],
})
export class OperationReportComponent implements OnInit, OnChanges {
  @Output() reloadTableList = new EventEmitter();
  @Input() soapFormEvent: string;

  inPatientOrrptDataSet: FormGroup;
  paramsObject: any;
  @ViewChild('inPatientPopup', { static: true }) configPopup: ConfigPopup;

  inPatientSurgeryHeaderData = [
    { columnTitle: 'Code', fieldName: 'Code', class: 'w-10' },
    { columnTitle: 'Description', fieldName: 'Description', class: 'w-25' },
    {
      columnTitle: 'Emp Responsible',
      fieldName: 'EmployeeResponsible',
      class: 'w-17',
    },
    { columnTitle: 'Employee Name', fieldName: 'EmployeeName', class: 'w-30' },
    { columnTitle: 'Date In', fieldName: 'NewDateIn', class: '' },
    { columnTitle: 'Date Out', fieldName: 'NewDateOut', class: '' },
  ];
  userConfig: UserConfig = {} as UserConfig;
  surgerySubscription: Subscription;
  preDiagnosisSubscription: Subscription;
  postDiagnosisSubscription: Subscription;
  surgeryTeamData: SurgeryTeamData[] = [];
  surgeryTableData: SurgeryTeamData[] = [];

  constructor(
    private admissionService: AdmissionService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private userConfigurationService: UserConfigurationService,
    private inPatientConfigurationService: InPatientConfigurationService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
    });
  }

  getUserConfigSetting() {
    this.userConfigurationService
      .getUserConfigData()
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((userconfig: UserConfig) => {
        this.userConfig = userconfig;
        // this.periodParameterMonthSelectValue =
        //   this.userconfig.PeriodParameterMonth;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.soapFormEvent.currentValue == 'add') {
      this.saveOperation(false);
    }

    if (changes.soapFormEvent.currentValue == 'edit') {
      this.saveOperation(false);
    }

    if (changes.soapFormEvent.currentValue == 'release') {
      this.saveOperation(true);
    }

    if (this.admissionService.isEditOperationReport || this.admissionService.isCloneOperationReport) {
      this.getOperationReport();
    }
  }

  ngOnInit(): void {
    this.getUserConfigSetting();
    this.initForm();
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');

    this.inPatientOrrptDataSet = new FormGroup({
      DateOfSurgery: new FormControl(new Date()),
      DocKey: new FormControl(''),
      OperationPerformed: new FormControl(''),
      OperativeComplication: new FormControl(''),
      TimeOfSurgery: new FormControl(currentTime),
      DateOfReportEntry: new FormControl(new Date()),
      SpecimenRemoved: new FormControl(''),
      BloodLoss: new FormControl(''),
      TimeOfReportEntry: new FormControl(currentTime),
      AnesthesiaType: new FormControl(''),
      BloodTransfused: new FormControl(''),
      PreOperativeDiagnosis: new FormControl(''),
      ProcedureRemarks: new FormControl(''),
      AnticipatedComplications: new FormControl(''),
      PostOperativeDiagnosis: new FormControl(''),
      IndicationForSurgery: new FormControl(''),
      Findings: new FormControl(''),
      ProcedureName: new FormControl(''),
      Description: new FormControl(''),
      Complications: new FormControl(''),
      Specimen: new FormControl(''),
    });
  }

  getOperationReport() {
    this.admissionService
      .getPatientVisitDataByDocKey(
        this.admissionService.selectedCurrentDocDetails.Dockey,
        this.paramsObject.einri,
        this.paramsObject.patnr
      )
      .subscribe((res: any) => {
        console.log(res, '--');
        if (res.PATDOCTOOPERRPTDOCDETAIL.results.length) {
          res.PATDOCTOOPERRPTDOCDETAIL.results.forEach((obj) => {
            if(!this.admissionService.isCloneOperationReport) {
              this.inPatientOrrptDataSet.patchValue({
                DateOfSurgery: this.parseDate(obj.DateOfSurgery),
                TimeOfSurgery: this.parseTime(obj.TimeOfSurgery),
                TimeOfReportEntry: this.parseTime(obj.TimeOfReportEntry),
                DateOfReportEntry: this.parseDate(obj.DateOfReportEntry),
              })
            }
            this.inPatientOrrptDataSet.patchValue({
              DocKey: res.DocKey,
              OperationPerformed: obj.OperationPerformed,
              OperativeComplication: obj.OperativeComplication,
              SpecimenRemoved: obj.SpecimenRemoved,
              BloodLoss: obj.BloodLoss,
              AnesthesiaType: obj.AnesthesiaType,
              BloodTransfused: obj.BloodTransfused,
              PreOperativeDiagnosis: obj.PreOperativeDiagnosis,
              ProcedureRemarks: obj.ProcedureRemarks,
              AnticipatedComplications: obj.AnticipatedComplications,
              PostOperativeDiagnosis: obj.PostOperativeDiagnosis,
              IndicationForSurgery: obj.IndicationForSurgery,
              Findings: obj.Findings,
              ProcedureName: obj.ProcedureName,
              Description: obj.Description,
              Complications: obj.Complications,
              Specimen: obj.Specimen
            })
          })
          if (res && res.PATDOCTOSURGICALTEAM && res.PATDOCTOSURGICALTEAM.results && res.PATDOCTOSURGICALTEAM.results.length) {
            this.surgeryTableData = res.PATDOCTOSURGICALTEAM.results;
          }
          // this.inPatientOrrptDataSet.patchValue(res.PATDOCTOOPERRPTDOCDETAIL.results[0])
        }
      });
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

  parsePayloadFormateTime(data: string) {
    if (data.slice(0, 2) == 'PT') {
      return data;
    }
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data && data.length === 8) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }

  saveReleaseGeneratePayload() {
    if (this.surgeryTableData && this.surgeryTableData.length) {
      this.surgeryTableData.forEach((item) => {
        item.DocKey = item.DocKey ? item.DocKey : "";
        delete item.Dockey;
        delete item.isSelected;
        delete item.CaseNumber;
        delete item.ServiceSequenceNumber;
        delete item.SequenceNumberMovem;
        delete item.NewDateIn;
        delete item.NewDateOut;
        delete item.__metadata;
      });
    }
    // if (this.preDiagnosisTableData && this.preDiagnosisTableData.length) {
    //   this.preDiagnosisTableData.forEach((item) => {
    //     item.DocKey = item.DocKey ? item.DocKey : "";
    //     delete item.isSelected;
    //     delete item.CaseNumber;
    //     delete item.PatientNumber;
    //     delete item.Institution;
    //     delete item.__metadata;
    //   });
    // }
    // if (this.postDiagnosisTableData && this.postDiagnosisTableData.length) {
    //   this.postDiagnosisTableData.forEach((item) => {
    //     item.DocKey = item.DocKey ? item.DocKey : "";
    //     delete item.isSelected;
    //     delete item.CaseNumber;
    //     delete item.PatientNumber;
    //     delete item.Institution;
    //     delete item.__metadata;
    //   });
    // }
  }

  saveOperation(isRelease) {
    this.formatePayloadDateTime();
    this.saveReleaseGeneratePayload();

    const saveDataList = {
      patientFormData: this.inPatientOrrptDataSet.value,
      surgeryData: this.surgeryTableData && this.surgeryTableData.length ? this.surgeryTableData : [],
      // preDiganosisData: this.preDiagnosisTableData && this.preDiagnosisTableData.length ? this.preDiagnosisTableData : [],
      // postDiagnosisData: this.postDiagnosisTableData && this.postDiagnosisTableData.length ? this.postDiagnosisTableData : [],
      // patientDtId: this.inPatientDataObj.Dtid === undefined && this.inPatientFormInput === "ORRPT" ? "ZMED_ORRPT" : this.inPatientDataObj.Dtid === undefined && this.inPatientFormInput === "OPERT" ? "ZMED_OPERT" : this.inPatientDataObj.Dtid
    };
    this.admissionService
      .saveOperationReport(
        saveDataList,
        this.userConfig,
        isRelease,
        this.paramsObject,
        this.admissionService.selectedCurrentDocDetails.Dockey
      )
      .subscribe((res: any) => {
        this.reloadTableList.next(true);
          this.admissionService.cancelAllForm();
          this.admissionService.clearSoapEvent.next(true);
      });
  }

  formatePayloadDateTime() {
    this.onChangeDate(this.inPatientOrrptDataSet.get('DateOfSurgery').value, "DateOfSurgery");
    this.onChangeDate(this.inPatientOrrptDataSet.get('DateOfReportEntry').value, "DateOfReportEntry");

    this.onChangeTime(this.inPatientOrrptDataSet.get('TimeOfSurgery').value, "TimeOfSurgery");
    this.onChangeTime(this.inPatientOrrptDataSet.get('TimeOfReportEntry').value, "TimeOfReportEntry");
  }

  onChangeDate(dateValue: any, controlType) {
    if (dateValue) {
      this.inPatientOrrptDataSet.get(controlType).patchValue(`\/Date(${new Date(`${this.datePipe.transform(dateValue, "yyyy-MM-dd")} 23:59:59`).getTime()})\/`);
    }
  }

  onChangeTime(timeValue: any, controlType) {
    if (timeValue) {
      this.inPatientOrrptDataSet.get(controlType).patchValue(this.parsePayloadFormateTime(timeValue));
    }
  }

  onOpenSurgeryPopup() {
    this.unsubscriptionData();
   
    this.loadSurgeyPopupData();
    
  }

  loadSurgeyPopupData() {
    this.admissionService.getSurgeryPopupData(this.paramsObject).subscribe((surgeryData: any) => {
      if (surgeryData && surgeryData.d && surgeryData.d.results && surgeryData.d.results.length) {
        surgeryData.d.results.forEach((item) => {
          item.DocKey = item.Dockey;
          item.NewDateIn = item.DateIn !== null ? item.DateIn : "";
          item.NewDateOut = item.DateOut !== null ? item.DateOut : "";
          item.DateIn = item.DateIn !== null ? item.DateIn : null;
          item.DateOut = item.DateOut !== null ? item.DateOut : null;
        })
      }
      this.surgeryTeamData = surgeryData.d.results;
      const headerData = [
        { columnTitle: "Code", fieldName: 'Code', class: 'w-15', disabled: true },
        { columnTitle: "Description", fieldName: 'Description', class: 'w-30', disabled: true },
        { columnTitle: "Employee", fieldName: 'EmployeeResponsible', class: 'w-25', disabled: true },
        { columnTitle: "Employee Name", fieldName: 'EmployeeName', class: 'w-30', disabled: true }
      ];
      this.configPopup.showPopup(headerData, this.surgeryTeamData, 'in-patient-template');
      if (this.surgerySubscription) { this.surgerySubscription.unsubscribe };
      this.surgerySubscription = this.configPopup.onClose.subscribe((data) => {
        if (data && data.length) {
          data.forEach((item) => {
            this.surgeryTableData.push(item);
          });
        }
        this.surgerySubscription.unsubscribe();
      })
    })
    
  }

  unsubscriptionData() {
    if (this.surgerySubscription) { this.surgerySubscription.unsubscribe(); }
    if (this.preDiagnosisSubscription) { this.preDiagnosisSubscription.unsubscribe(); }
    if (this.postDiagnosisSubscription) { this.postDiagnosisSubscription.unsubscribe(); }
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }
  parseDate(date: string) {
    if (date) {
      return new Date(
        new Date(
          +date.replace('/Date(', '').replace(')/', '')
        ).toLocaleDateString('en-US')
      );
    }
  }
}