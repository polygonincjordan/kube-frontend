import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, ViewChild, } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { StorageService } from '@services/storage.service';
import Swal from 'sweetalert2';
import { GynDiagnosisComponent } from '../obs-gyn/diagnosis/diagnosis.component';
import { SharedService } from '@services/shared.service';
import { MedicationOrderTypeLabels } from '@services/interfaces/common.enum';
import { IMedicationImportData } from 'src/app/components/documentation/import-medication/import-medication.component';
import { DocsService } from '@services/docs.service';
import { CommanService } from '@services/comman.service';

@Component({
  selector: 'app-discharge-summary',
  templateUrl: './discharge-summary.component.html',
  styleUrls: ['./discharge-summary.component.scss'],
})
export class DischargeSummaryComponent implements OnInit, OnChanges {
  @Input() soapFormEvent!: string;
  @Output() reloadTableList = new EventEmitter();
  @ViewChild('diagnosisNotesKardexId') diagnosisNotesKardex!: GynDiagnosisComponent;
  orderType = MedicationOrderTypeLabels;
  inPatientPhdisDataSet!: FormGroup;
  dischargeDispositionList: any = [
    { Desc: 'Vitally Stable', Value: '0' },
    { Desc: 'Discharged Home', Value: '1' },
    { Desc: 'DAMA', Value: '2' },
    { Desc: 'Deceased', Value: '3' },
    { Desc: 'Transferred to another hospital', Value: '4' },
    { Desc: 'Others, Specify', Value: '5' },
  ];
  NeedTransport: any = [
    { Desc: 'Yes', Value: true },
    { Desc: 'No', Value: false },
  ];
  inPatientDischargeData: any;
  @Input() set userConfigSet(data: UserConfig) {
    this.userConfig = data;
  }

  medicationImportData!: IMedicationImportData;

  userConfig: UserConfig = {} as UserConfig;
  paramsObj
  isDisabledOther: boolean = false;
  isCheckAPICall: boolean = false;
  dischargeSummaryConfiguration: any[] = [];
  constructor(
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private admissionService: AdmissionService,
    private inPatientConfigurationService: InPatientConfigurationService,
    private modalService: BsModalService,
    public storageService: StorageService,
    public ePrescriptionService: EPrescriptionService,
    public sharedService: SharedService,
    private docsService: DocsService,
    private commanService: CommanService

  ) {
    this.route.queryParams.subscribe((res) => {
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
    if (changes.soapFormEvent.currentValue == 'saveClose') {
      this.savePhysicianDischarge(false);
    }

    if (changes.soapFormEvent.currentValue == 'edit') {
      this.savePhysicianDischarge(false);
    }

    if (changes.soapFormEvent.currentValue == 'release') {
      this.savePhysicianDischarge(true)
    }

    if (changes.soapFormEvent.currentValue == 'toReleaseDis') {
      this.getDichargeDataByDockey(true);
    }
    debugger;
    if (this.admissionService.isCloneDischargeSummery || this.admissionService.isEditDischargeSummery) {
      debugger;
      if (!this.isCheckAPICall) {
        this.getDichargeDataByDockey(false);
      }
    }
  }

  getDichargeDataByDockey(isRelease) {
    this.inPatientConfigurationService
      .getPhyDischSummarySetByDocKey(this.admissionService.selectedCurrentDocDetails.Dockey)
      .subscribe((resp) => {
        if (resp && resp.results && resp.results.length) {
          this.inPatientDischargeData = resp.results[0];
          console.log(this.inPatientDischargeData);
          this.isCheckAPICall = true;
          let dockey: string = '';
          if (this.admissionService.isCloneDischargeSummery) {
            dockey = '';
          } else {
            dockey = this.inPatientDischargeData.Dockey;
          }
          // const FormData = resp.results[0].ToFormData.results[0];
          this.inPatientPhdisDataSet.patchValue({
            Dockey: dockey,
            AdmissionReason: this.inPatientDischargeData.AdmissionReason,
            Diagnoses: this.inPatientDischargeData.Diagnoses,
            DiagnosticTherapeutic: this.inPatientDischargeData.DiagnosticTherapeutic,
            // EvolutionSummary: this.inPatientDischargeData.EvolutionSummary,
            // RelevantResultsAdm: this.inPatientDischargeData.RelevantResultsAdm,
            PhysicalExaminationDischarge: this.inPatientDischargeData.PhysicalExaminationDischarge,
            DischargePlan: this.inPatientDischargeData.DischargePlan,
            PatientCondition: this.inPatientDischargeData.PatientCondition,
            SignificantPhysical: this.inPatientDischargeData.SignificantPhysical,
            TherapeuticEquipment: this.inPatientDischargeData.TherapeuticEquipment,
            // MgmtTreatmentPlan: this.inPatientDischargeData.MgmtTreatmentPlan,
            // MgmtRecommendations: this.inPatientDischargeData.MgmtRecommendations,
            // DischargeCondition: this.inPatientDischargeData.DischargeCondition,
            DischargeDisposition: this.inPatientDischargeData.DischargeDisposition,
            DischargeDispositionOth: this.inPatientDischargeData.DischargeDispositionOth,
            NeedsTransport: this.inPatientDischargeData.NeedsTransport,
            DischargeReason: this.inPatientDischargeData.DischargeReason,
            // DischargeFollowipInstruction: this.inPatientDischargeData.DischargeFollowipInstruction,
            NoDiagnosis: this.inPatientDischargeData.NoDiagnosis,
            NomedSubstancesAppl: this.inPatientDischargeData.NomedSubstancesAppl,
            Substances: this.inPatientDischargeData.Substances,
            NoMedordAppl: this.inPatientDischargeData.NoMedordAppl,
          });

          if (!this.admissionService.isCloneDischargeSummery) {
            this.inPatientPhdisDataSet.patchValue({
              Date: this.getDate(this.inPatientDischargeData.Datee),
              Time: this.parseTime(this.inPatientDischargeData.Timee),
            })
          }
          // this.toDiagnosisArr = this.inPatientDischargeData.ToDiagnosis.results;

          this.medicationImportData = {
            'Hospital Medication': {
              applicable: this.inPatientPhdisDataSet.value.NomedSubstancesAppl,
              importedMedications: this.inPatientDischargeData?.TOHOSPMED?.results,
            },
            'Discharge and Home Medication': {
              applicable: this.inPatientPhdisDataSet.value.NoMedordAppl,
              importedMedications: this.inPatientDischargeData?.TODISCHMED?.results,
            },
          };
          console.log('medicationImportData', this.medicationImportData);

          if (isRelease) {
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
    
    const ToDiagnosis = this.toDiagnosisArr;
    ToFormData['NoDiagnosis'] = this.inPatientPhdisDataSet.value.NoDiagnosis;
    
    const ToHospitalMed = this.medicationImportData?.['Hospital Medication']?.importedMedications;
    ToFormData['NomedSubstancesAppl'] = this.medicationImportData?.['Hospital Medication']?.applicable;
    
    const ToDischargeMed = this.medicationImportData?.['Discharge and Home Medication']?.importedMedications;
    ToFormData['NoMedordAppl'] = this.medicationImportData?.['Discharge and Home Medication']?.applicable;

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
        this.admissionService.isEditDischargeSummery = false;
        this.admissionService.isCloneDischargeSummery = false;
        this.docsService.showSuccessMsg(this.soapFormEvent, 'Physician Discharge Summary');
      },
      error: (error: any) => {
        this.admissionService.clearSoapEvent.next(true);
        this.admissionService.isCloneNicuForm = false;
        this.admissionService.isEditNicuForm = false;
        const errorMsg = error?.error?.error?.message?.value || 'Unknown error';
        this.docsService.showErrorMsg(error);
      },
    });
  }

  updatePhysicianDischarge(isRelease) {
    debugger;
    const ToFormData = this.inPatientPhdisDataSet.value;
    ToFormData.Time = this.parsePayloadFormateTime(ToFormData.Time)
    ToFormData.Date = ToFormData.Date ? this.sanitizeSAPDateFormat(ToFormData.Date) : null;

    const ToDiagnosis = this.toDiagnosisArr;
    ToFormData['NoDiagnosis'] = this.inPatientPhdisDataSet.value.NoDiagnosis;
    const ToHospitalMed = this.medicationImportData?.['Hospital Medication']?.importedMedications;
    ToFormData['NomedSubstancesAppl'] = this.medicationImportData?.['Hospital Medication']?.applicable;

    const ToDischargeMed = this.medicationImportData?.['Discharge Medication']?.importedMedications;
    ToFormData['NoMedordAppl'] = this.medicationImportData?.['Discharge Medication']?.applicable;

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
        this.sharedService.successSwallModel('Physician Discharge Summary Updated successfully');
      },
      error: (error: any) => {
        this.admissionService.clearSoapEvent.next(true);
        const errorMsg = error?.error?.error?.message?.value || 'Unknown error';
        this.sharedService.waringSwallModel(`${errorMsg}`);
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
    console.log(currentTime,);
    this.inPatientPhdisDataSet = new FormGroup({
      Dockey: new FormControl(''),
      AdmissionReason: new FormControl(''),
      Diagnoses: new FormControl(''),
      SignificantPhysical: new FormControl(''),
      DiagnosticTherapeutic: new FormControl(''),
      TherapeuticEquipment: new FormControl(''),
      PatientCondition: new FormControl(''),
      DischargePlan: new FormControl(''),
      // EvolutionSummary: new FormControl(''),
      // RelevantResultsAdm: new FormControl(''),
      PhysicalExaminationDischarge: new FormControl(''),
      MgmtTreatmentPlan: new FormControl(''),
      // MgmtRecommendations: new FormControl(''),
      // DischargeCondition: new FormControl(''),
      Orgdo: new FormControl(''),
      Datee: new FormControl(''),
      Timee: new FormControl(''),
      // Date: new FormControl(null),
      // Time: new FormControl(this.parseTime(this.datePipe.transform(new Date(), "hh:mm:ss"))),
      DischargeDisposition: new FormControl(null),
      DischargeDispositionOth: new FormControl(''),
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
    data.DischargeDisposition === '5'
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

  toDiagnosisArr: any = [];
  duplicates: any = [];


  importDiagnosisData(data) {
    data.forEach(el => {
      this.toDiagnosisArr = this.toDiagnosisArr.concat({
        "Dockey": "",
        "Code": el.DiagKey1,
        "Description": el.DiagShorttext,
        "Remarks": el.DiagText,
        "AdmDiagnosisInd": el.AdmissionDia,
        "DischargDiagnosisInd": el.DischargeDia,
        "WorkingDiagnosisInd": el.WorkDiagInd,
        "PreoprativeDiagnosisInd": el.PreopDiagInd,
        "SurgeryDiagnosisInd": el.SurgeryDia,
        "DeathCauseDiagnosisInd": el.CauseOfDeath,
        "DeptMainDiagnosisInd": el.DeptMainDia,
        "HospMainDiagnosisInd": el.HospMainDia
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesDiagnosis();
    this.toDiagnosisArr = this.toDiagnosisArr.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.Code === value.Code
      ))
    )
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesDiagnosis();
    }

  }

  findDuplicatesDiagnosis() {
    let tempArr = []
    const lookup = this.toDiagnosisArr.reduce((a, e) => {
      a[e.Code] = ++a[e.Code] || 0;
      return a;
    }, {});
    tempArr = this.toDiagnosisArr.filter(e => lookup[e.Code]);
    return tempArr.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.Code === value.Code
      ))
    )

  }

  errorMsgForDuplicatesDiagnosis() {
    let codeArr = [];
    this.duplicates.forEach(element => {
      codeArr.push(element.Code);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' }
    })
  }

  deleteDiagnosisFromTable(item, index) {
    this.toDiagnosisArr.splice(index, 1);
  }

  openModalForDiagnosis() {
    this.diagnosisNotesKardex.openModalForDiagnosisKardex();
  }
}
