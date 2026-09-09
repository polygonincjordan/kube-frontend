import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';

@Component({
  selector: 'app-discharge-summary',
  templateUrl: './discharge-summary.component.html',
  styleUrls: ['./discharge-summary.component.scss'],
})
export class DischargeSummaryComponent implements OnInit, OnChanges {
  @Input() soapFormEvent: string;
  @Output() reloadTableList = new EventEmitter();

  inPatientPhdisDataSet: FormGroup;
  dischargeDispositionList: any = [
    { Desc: 'Discharge Home', Value: '0' },
    { Desc: 'DAMA', Value: '1' },
    { Desc: 'Deceased', Value: '2' },
    { Desc: 'Others', Value: '3' },
    { Desc: 'Admitted to hospital', Value: '4' },
    { Desc: 'Transferred to another hospital', Value: '5' },
  ];
  NeedTransport: any = [
    { Desc: 'Yes', Value: true },
    { Desc: 'No', Value: false },
  ];
  inPatientDischargeData: any;
  @Input() set userConfigSet(data: UserConfig) {
    this.userConfig = data;
  }

  userConfig: UserConfig = {} as UserConfig;
  paramsObj
  isDisabledOther: boolean = false;
  isCheckAPICall: boolean = false;
  dischargeSummaryConfiguration: any[] = [];
  constructor(
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private admissionService: AdmissionService,
    private inPatientConfigurationService: InPatientConfigurationService
  ) {
    this.route.queryParams.subscribe((res)=>{
      this.paramsObj = res
    })
  }

  ngOnInit(): void {
    this.initForm();
    // this.loadDischargeSummarySet();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.soapFormEvent.currentValue == 'add') {
      this.savePhysicianDischarge(false);
    }

    if (changes.soapFormEvent.currentValue == 'edit') {
      this.savePhysicianDischarge(false);
    }

    if(changes.soapFormEvent.currentValue == 'release') {
      this.savePhysicianDischarge(true)
    }

    if(changes.soapFormEvent.currentValue == 'toReleaseDis') {
      this.getDichargeDataByDockey(true);
    }
    if (this.admissionService.isCloneDischargeSummery || this.admissionService.isEditDischargeSummery) {
      if(!this.isCheckAPICall) {
        this.getDichargeDataByDockey(false);
      }
    }
  }

  getDichargeDataByDockey(isRelease) {
    this.inPatientConfigurationService.getPatientSummaryDataByDocKey(this.admissionService.selectedCurrentDocDetails.Dockey).subscribe((resp) => {
      if (resp && resp.results && resp.results.length) {
        this.inPatientDischargeData = resp;
        this.isCheckAPICall = true;
        const FormData = resp.results[0].ToFormData.results[0];
        this.inPatientPhdisDataSet.patchValue({
          Dockey: FormData.Dockey,
          AdmissionReason: FormData.AdmissionReason,
          EvolutionSummary: FormData.EvolutionSummary,
          RelevantResultsAdm: FormData.RelevantResultsAdm,
          PhysicalExaminationDischarge: FormData.PhysicalExaminationDischarge,
          MgmtTreatmentPlan: FormData.MgmtTreatmentPlan,
          MgmtRecommendations: FormData.MgmtRecommendations,
          DischargeCondition: FormData.DischargeCondition,
          DischargeDisposition: FormData.DischargeDisposition,
          DischargeDispositionOthers: FormData.DischargeDispositionOthers,
          NeedsTransport: FormData.NeedsTransport,
          DischargeReason: FormData.DischargeReason,
          DischargeFollowipInstruction: FormData.DischargeFollowipInstruction,
          NoDiagnosis: FormData.NoDiagnosis,
          NomedSubstancesAppl: FormData.NomedSubstancesAppl,
          Substances: FormData.Substances,
          NoMedordAppl: FormData.NoMedordAppl,
        });

        if (!this.admissionService.isCloneDischargeSummery) {
          this.inPatientPhdisDataSet.patchValue({
            Date: this.getDate(FormData.Date),
            Time: this.parseTime(FormData.Time),
          })
        }
        if(isRelease) {
          this.savePhysicianDischarge(true);
        }
      }
    })
  }

  parseDate(date: string) {
    if (date) {
      return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
    }
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  savePhysicianDischarge(isRelease) {
    const ToFormData = this.inPatientPhdisDataSet.value;
    ToFormData.Time = this.parsePayloadFormateTime(ToFormData.Time)
    ToFormData.Date = ToFormData.Date ? this.sanitizeSAPDateFormat(ToFormData.Date) : null;

    const ToDischargeMed = this.inPatientDischargeData?.results[0]?.ToDischargeMed?.results;
    const ToHospitalMed = this.inPatientDischargeData?.results[0]?.ToHospitalMed?.results;
    const ToDiagnosis = this.inPatientDischargeData?.results[0]?.ToDiagnosis?.results;

    const data = { 
      Release: isRelease, 
      ToFormData, 
      ToDiagnosis, 
      ToHospitalMed, 
      ToDischargeMed 
    };

    this.admissionService.saveInPatientPhdisData(data, this.userConfig, this.paramsObj).subscribe({
      next: () => {
        this.reloadTableList.next(true);
        this.admissionService.cancelAllForm();
        this.admissionService.clearSoapEvent.next(true);
      },
      error: (error: any) => {
        this.admissionService.clearSoapEvent.next(true);
      },
    });
  }

  updatePhysicianDischarge(isRelease) {
    const ToFormData = this.inPatientPhdisDataSet.value;
    ToFormData.Time = this.parsePayloadFormateTime(ToFormData.Time)
    ToFormData.Date = ToFormData.Date ? this.sanitizeSAPDateFormat(ToFormData.Date) : null;

    const ToDischargeMed = this.inPatientDischargeData?.results[0]?.ToDischargeMed?.results;
    const ToHospitalMed = this.inPatientDischargeData?.results[0]?.ToHospitalMed?.results;
    const ToDiagnosis = this.inPatientDischargeData?.results[0]?.ToDiagnosis?.results;

    const data = { 
      Release: isRelease, 
      ToFormData, 
      ToDiagnosis, 
      ToHospitalMed, 
      ToDischargeMed 
    };

    this.admissionService.updateInPatientPhdisData(data, this.userConfig, this.paramsObj).subscribe({
      next: () => {
        this.reloadTableList.next(true);
        this.admissionService.cancelAllForm();
        this.admissionService.clearSoapEvent.next(true);
      },
      error: (error: any) => {
        this.admissionService.clearSoapEvent.next(true);
      },
    });
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof (date) === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`
    }
  }

  loadDischargeSummarySet() {
    this.admissionService
      .getDischargeSummarySet(this.paramsObj)
      .subscribe((resp) => {
        if (resp && resp['d'] && resp['d'].results) {
          this.dischargeSummaryConfiguration = resp['d'].results;
        }
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

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), "hh:mm:ss");
    console.log(currentTime, );
    this.inPatientPhdisDataSet = new FormGroup({
      Dockey: new FormControl(''),
      AdmissionReason: new FormControl(''),
      EvolutionSummary: new FormControl(''),
      RelevantResultsAdm: new FormControl(''),
      PhysicalExaminationDischarge: new FormControl(''),
      MgmtTreatmentPlan: new FormControl(''),
      MgmtRecommendations: new FormControl(''),
      DischargeCondition: new FormControl(''),
      Date: new FormControl(null),
      Time:  new FormControl(this.parseTime(this.datePipe.transform(new Date(), "hh:mm:ss"))),
      DischargeDisposition: new FormControl(null),
      DischargeDispositionOthers: new FormControl(''),
      NeedsTransport: new FormControl(false),
      DischargeReason: new FormControl(''),
      DischargeFollowipInstruction: new FormControl(''),
      NoDiagnosis: new FormControl(false),
      NomedSubstancesAppl: new FormControl(false),
      Substances: new FormControl(''),
      NoMedordAppl: new FormControl(false),
    });
  }

  onChangeOtherOption(data: any) {
    data.DischargeDisposition === '4'
      ? (this.isDisabledOther = false)
      : (this.isDisabledOther = true);
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
}
