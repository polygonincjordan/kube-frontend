import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { DiagnosesData, InPatientDataResult, SurgeryTeamData } from '@services/e-kardex/interfaces/inpatient-data';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { Subscription } from 'rxjs';
import { ConfigPopup } from '../../../core/config-popup/config-popup.component';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { CorrespondenceDocumentComponent } from 'src/app/shared-module/correspondence-document/correspondence-document.component';
import Swal from 'sweetalert2';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { MedicalReportComponent } from './medical-report/medical-report.component';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';

@Component({
  selector: 'diagnoses-in-patient',
  templateUrl: './diagnoses-in-patient.component.html',
  styleUrls: ['./diagnoses-in-patient.component.scss']
})

export class DiagnosesInPatientComponent implements OnInit, OnDestroy {
  @ViewChild(CorrespondenceDocumentComponent) CorrespondenceComp: CorrespondenceDocumentComponent;
  @ViewChild(MedicalReportComponent) MedicalReportComp: MedicalReportComponent;
  
  inPatientDataSet: FormGroup;
  inPatientOrrptDataSet: FormGroup;
  inPatientPhdisDataSet: FormGroup;
  isDisabledOther: boolean = true;
  subscription: Subscription;

  userConfig: UserConfig = {} as UserConfig;
  isDelete: boolean = false;
  dischargeSummaryConfiguration: any[];

  surgeryTeamData: SurgeryTeamData[] = [];
  diagnosisData: DiagnosesData[];

  inPatientSurgeryHeaderData: any[];
  inPatientDiagnosisHeaderData: any[];

  surgeryTableData: SurgeryTeamData[] = [];
  preDiagnosisTableData: DiagnosesData[] = [];
  postDiagnosisTableData: DiagnosesData[] = [];

  surgerySubscription: Subscription;
  preDiagnosisSubscription: Subscription;
  postDiagnosisSubscription: Subscription;

  inPatientDataObj: any;
  inPatientFormInput: string;
  soapFormEvent: string;

  dischargeDispositionList: any = [
    { Desc: "Discharge Home", Value: "0" },
    { Desc: "DAMA", Value: "1" },
    { Desc: "Deceased", Value: "2" },
    { Desc: "Others", Value: "3" },
    { Desc: "Admitted to hospital", Value: "4" },
    { Desc: "Transferred to another hospital", Value: "5" }
  ]

  NeedTransport: any = [
    { Desc: "Yes", Value: true },
    { Desc: "No", Value: false },
  ]


  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  @Output() updateEvent: EventEmitter<any> = new EventEmitter<any>();
  paramsObject: any;


  @Input() set userConfigSet(data: UserConfig) { this.userConfig = data; }

  @Input() set inPatientForm(data: string) {
    this.inPatientFormInput = data;
  }
  @Input() selectedPatient: any;
  @Input() patientVisitRecord: any;

  @Input() set inPatientVisitData(data) {
    this.inPatientDataObj = data
    if (data && data.PATDOCTOOPERRPTDOCDETAIL && data.PATDOCTOOPERRPTDOCDETAIL.results && data.PATDOCTOOPERRPTDOCDETAIL.results.length) {
      data.PATDOCTOOPERRPTDOCDETAIL.results.forEach((obj) => {
        if (data.Dtid === "ZMED_OPERT") {
          this.inPatientDataSet.patchValue({
            DocKey: obj.DocKey,
            OperationPerformed: obj.OperationPerformed,
            OperativeComplication: obj.OperativeComplication,
            SpecimenRemoved: obj.SpecimenRemoved,
            BloodLoss: obj.BloodLoss,
            BloodTransfused: obj.BloodTransfused,
            ProcedureRemarks: obj.ProcedureRemarks,
            AnticipatedComplications: obj.AnticipatedComplications,
          });
        } else if (data.Dtid === "ZMED_ORRPT") {
          this.inPatientOrrptDataSet.patchValue({
            DateOfSurgery: this.parseDate(obj.DateOfSurgery),
            DocKey: data.DocKey,
            OperationPerformed: obj.OperationPerformed,
            OperativeComplication: obj.OperativeComplication,
            TimeOfSurgery: this.parseTime(obj.TimeOfSurgery),
            DateOfReportEntry: this.parseDate(obj.DateOfReportEntry),
            SpecimenRemoved: obj.SpecimenRemoved,
            BloodLoss: obj.BloodLoss,
            TimeOfReportEntry: this.parseTime(obj.TimeOfReportEntry),
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
        }
        if (data.DataType !== "in-patient") {
          this.isDelete = true;
        }
      })
    }
    if (data && data.PATDOCTOPREOPERATIVEDX && data.PATDOCTOPREOPERATIVEDX.results && data.PATDOCTOPREOPERATIVEDX.results.length) {
      this.preDiagnosisTableData = data.PATDOCTOPREOPERATIVEDX.results;
    }
    if (data && data.PATDOCTOPOSTOPERATIVEDX && data.PATDOCTOPOSTOPERATIVEDX.results && data.PATDOCTOPOSTOPERATIVEDX.results.length) {
      this.postDiagnosisTableData = data.PATDOCTOPOSTOPERATIVEDX.results;
    }
    if (data && data.PATDOCTOSURGICALTEAM && data.PATDOCTOSURGICALTEAM.results && data.PATDOCTOSURGICALTEAM.results.length) {
      this.surgeryTableData = data.PATDOCTOSURGICALTEAM.results;
    }
  }

  @Input() set inPatientDischargeData(data: any) {
    if (data && data.results && data.results[0].ToFormData && data.results[0].ToFormData.results) {
      this.inPatientDataObj = data.results[0]
      data.results[0].ToFormData.results.forEach((element => {
        delete element.__metadata;
      }));
      const FormData = data.results[0].ToFormData.results[0];
      this.inPatientPhdisDataSet.patchValue({
        Dockey: FormData.Dockey,
        AdmissionReason: FormData.AdmissionReason,
        EvolutionSummary: FormData.EvolutionSummary,
        RelevantResultsAdm: FormData.RelevantResultsAdm,
        PhysicalExaminationDischarge: FormData.PhysicalExaminationDischarge,
        MgmtTreatmentPlan: FormData.MgmtTreatmentPlan,
        MgmtRecommendations: FormData.MgmtRecommendations,
        DischargeCondition: FormData.DischargeCondition,
        Date: this.parseDate(FormData.Date),
        Time: this.parseTime(FormData.Time),
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
      if (data.DataType !== "in-patient") {
        this.isDelete = true;
      }
    }
  }

  @ViewChild('inPatientPopup', { static: true }) configPopup: ConfigPopup;

  constructor(private inPatientConfigurationService: InPatientConfigurationService, private datePipe: DatePipe , private route: ActivatedRoute, private admissionService: AdmissionService, private dayCaseDashboardService: DayCaseDashboardService, private emergencyService: EmergencyService) {
    this.inPatientDataSet = new FormGroup({
      DocKey: new FormControl(""),
      OperationPerformed: new FormControl(""),
      OperativeComplication: new FormControl(""),
      SpecimenRemoved: new FormControl(""),
      BloodLoss: new FormControl(""),
      BloodTransfused: new FormControl(""),
      ProcedureRemarks: new FormControl(""),
      AnticipatedComplications: new FormControl("")
    });

    this.inPatientOrrptDataSet = new FormGroup({
      DateOfSurgery: new FormControl(new Date()),
      DocKey: new FormControl(""),
      OperationPerformed: new FormControl(""),
      OperativeComplication: new FormControl(""),
      TimeOfSurgery: new FormControl(this.parseTime("PT00H00M00S")),
      DateOfReportEntry: new FormControl(new Date()),
      SpecimenRemoved: new FormControl(""),
      BloodLoss: new FormControl(""),
      TimeOfReportEntry: new FormControl(this.parseTime("PT00H00M00S")),
      AnesthesiaType: new FormControl(""),
      BloodTransfused: new FormControl(""),
      PreOperativeDiagnosis: new FormControl(""),
      ProcedureRemarks: new FormControl(""),
      AnticipatedComplications: new FormControl(""),
      PostOperativeDiagnosis: new FormControl(""),
      IndicationForSurgery: new FormControl(""),
      Findings: new FormControl(""),
      ProcedureName: new FormControl(""),
      Description: new FormControl(""),
      Complications: new FormControl(""),
      Specimen: new FormControl("")

    });
    this.inPatientPhdisDataSet = new FormGroup({
      Dockey: new FormControl(""),
      AdmissionReason: new FormControl(""),
      EvolutionSummary: new FormControl(""),
      RelevantResultsAdm: new FormControl(""),
      PhysicalExaminationDischarge: new FormControl(""),
      MgmtTreatmentPlan: new FormControl(""),
      MgmtRecommendations: new FormControl(""),
      DischargeCondition: new FormControl(""),
      Date: new FormControl(null),
      Time: new FormControl(this.parseTime(this.datePipe.transform(new Date(), "hh:mm:ss"))),
      DischargeDisposition: new FormControl(null),
      DischargeDispositionOthers: new FormControl(""),
      NeedsTransport: new FormControl(false),
      DischargeReason: new FormControl(""),
      DischargeFollowipInstruction: new FormControl(""),
      NoDiagnosis: new FormControl(false),
      NomedSubstancesAppl: new FormControl(false),
      Substances: new FormControl(""),
      NoMedordAppl: new FormControl(false)
    })
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      console.log(this.paramsObject);
    });
  }

  ngOnInit(): void {
    this.inPatientSurgeryHeaderData = [
      { columnTitle: "Code", fieldName: 'Code', class: 'w-10' },
      { columnTitle: "Description", fieldName: 'Description', class: 'w-25' },
      { columnTitle: "Emp Responsible", fieldName: 'EmployeeResponsible', class: 'w-17' },
      { columnTitle: "Employee Name", fieldName: 'EmployeeName', class: 'w-30' },
      { columnTitle: "Date In", fieldName: 'NewDateIn', class: '' },
      { columnTitle: "Date Out", fieldName: 'NewDateOut', class: '' }
    ]
    this.inPatientDiagnosisHeaderData = [
      { columnTitle: "Code", fieldName: 'Code', class: 'w-25' },
      { columnTitle: "Description", fieldName: 'Description', class: 'w-48' },
      { columnTitle: "", fieldName: 'EmployeeResponsible', class: 'w-17' }
    ]
    this.subscription = this.route.queryParams.subscribe(() => {
    this.loadDiagnosisData();
    this.loadSurgeyPopupData();
    this.loadDischargeSummarySet();
    // this.ReleasePhdisForm();
  })
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
    if (this.preDiagnosisTableData && this.preDiagnosisTableData.length) {
      this.preDiagnosisTableData.forEach((item) => {
        item.DocKey = item.DocKey ? item.DocKey : "";
        delete item.isSelected;
        delete item.CaseNumber;
        delete item.PatientNumber;
        delete item.Institution;
        delete item.__metadata;
      });
    }
    if (this.postDiagnosisTableData && this.postDiagnosisTableData.length) {
      this.postDiagnosisTableData.forEach((item) => {
        item.DocKey = item.DocKey ? item.DocKey : "";
        delete item.isSelected;
        delete item.CaseNumber;
        delete item.PatientNumber;
        delete item.Institution;
        delete item.__metadata;
      });
    }
  }

  saveForm() {
    this.formatePayloadDateTime();
    this.saveReleaseGeneratePayload();
    const saveDataList = {
      patientFormData: this.inPatientFormInput === "OPERT" ? this.inPatientDataSet.value : this.inPatientOrrptDataSet.value,
      surgeryData: this.surgeryTableData && this.surgeryTableData.length ? this.surgeryTableData : [],
      preDiganosisData: this.preDiagnosisTableData && this.preDiagnosisTableData.length ? this.preDiagnosisTableData : [],
      postDiagnosisData: this.postDiagnosisTableData && this.postDiagnosisTableData.length ? this.postDiagnosisTableData : [],
      patientDtId: this.getPatientDtId()
    };
    this.inPatientConfigurationService.saveInPatientDocumentData(saveDataList, this.userConfig, false)
    this.updateEvent.emit(true);
  }

  realodEducationList(event: any) {
    this.updateEvent.emit(true);
  }

  savePhysicianAssessmentForm(actionType: string) {
    if(actionType == 'close') {
      this.closeInPatientForm();
      return;
    }
    if(actionType == 'release') {
      this.soapFormEvent = actionType;
      return;
    }
    if(this.admissionService.isEditPhysicianForm) {
      this.soapFormEvent = "edit";
    } else {
      this.soapFormEvent = actionType;
    }
  }


  getPatientDtId(): string {
    if (this.inPatientDataObj.Dtid === undefined) {
      return this.inPatientFormInput === "ORRPT" ? "ZMED_ORRPT" : "ZMED_OPERT";
    }
    return this.inPatientDataObj.Dtid;
  }

  loadDischargeSummarySet() {
    this.inPatientConfigurationService.getDischargeSummarySet().subscribe((resp) => {
      if (resp && resp['d'] && resp['d'].results) {
        this.dischargeSummaryConfiguration = resp['d'].results;
      }
    })
  }

  savePhdisForm() {
    this.inPatientPhdisDataSet.patchValue({
      Time: this.parsePayloadFormateTime(this.inPatientPhdisDataSet.value.Time),
      Date: this.inPatientPhdisDataSet.value.Date !== undefined && this.inPatientPhdisDataSet.value.Date !== null? `\/Date(${this.inPatientPhdisDataSet.value.Date.getTime()})\/`: null
    })
    const saveDataList = {
      patientFormData: this.inPatientPhdisDataSet.value,
      releaseForm: false
    };
    this.inPatientConfigurationService.saveInPatientPhdisData(saveDataList, this.dischargeSummaryConfiguration[0], this.userConfig).subscribe((resp)=>{
      this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
    });
    this.updateEvent.emit(true);
  }

  saveCorrespondenceDocument() {
    let docStatus = this.selectedPatient?.DokstText == 'Released' ? '3' : '1';
    // if(this.selectedDocData?.Dockey) docStatus = '3';
    this.CorrespondenceComp.createCorrespondenceDocument(docStatus).then((formValue: any) => {
      if (formValue) {
        // this.refresh();
        this.updateEvent.emit(true);
        this.selectedPatient = '';
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Correspondence Document:', error);
    });
  }

  releaseCorresponde() {
    let docStatus = this.selectedPatient?.Dockey ? this.selectedPatient?.DokstText == 'Released' ? '5' : '2' : '4';
    this.CorrespondenceComp.createCorrespondenceDocument(docStatus).then((formValue) => {
      if (formValue) {
        // this.refresh();
      this.updateEvent.emit(true);
      this.selectedPatient = '';
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating CPR document:', error);
    });
  }

  saveMedicalReport() {
    let docStatus = this.selectedPatient?.DokstText == 'Released' || this.selectedPatient?.Released == "X" ? '1' : '1';
    this.MedicalReportComp.createMedicalReport(docStatus).then((formValue: any) => {
      if (formValue) {
        // this.refresh();
        this.updateForm(true);
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Correspondence Document:', error);
    });
  }

  updateMedicalReport() {
    let docStatus = this.selectedPatient?.DokstText == 'Released' || this.selectedPatient?.Released == "X" ? '3' : '1';
    this.MedicalReportComp.updateMedicalReport(docStatus).then((formValue: any) => {
      if (formValue) {
        // this.refresh();
        this.updateForm(true);
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating Correspondence Document:', error);
    });
  }

  releaseMedicalReport() {
    let docStatus = this.selectedPatient?.Dockey ? this.selectedPatient?.DokstText == 'Released' ? '5' : '2' : '4';
    this.MedicalReportComp.releaseMedicalReport(docStatus).then((formValue) => {
      if (formValue) {
        // this.refresh();
      this.updateForm(true);
      }
    }).catch((error: any) => {
      console.error('Error scale:', error);
      console.error('Error creating CPR document:', error);
    });
  }

  deleteCorrespondenceDoc(docKey: string) {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    }).then((result) => {
      if (result.value) {
        (this.dayCaseDashboardService.deleteCorrespondenceDocument(docKey)).subscribe(
          (_success: any) => {
            this.updateEvent.emit(true);
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            })
            // this.refresh();
          },
          (_error: any) => {
            Swal.fire({
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
              icon: 'warning',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            })
            // this.refresh();
          }
        );
      }
    });
  }

  deleteMedicalReporteDoc(docKey: string) {
    const json = {
      Dockey : docKey
    }
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' }
    }).then((result) => {
      if (result.value) {
        (this.emergencyService.deleteMedReport(json)).subscribe(
          (_success: any) => {
            this.updateEvent.emit(true);
            Swal.fire({
              text: "Document is deleted successfully",
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            })
            // this.refresh();
          },
          (_error: any) => {
            Swal.fire({
              text: `${_error.error.error.innererror?.errordetails[0]?.message}`,
              icon: 'warning',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' }
            })
            // this.refresh();
          }
        );
      }
    });
  }

  releasePhdisForm() {
    this.inPatientPhdisDataSet.patchValue({
      Time: this.parsePayloadFormateTime(this.inPatientPhdisDataSet.value.Time),
      Date: this.inPatientPhdisDataSet.value.Date !== undefined && this.inPatientPhdisDataSet.value.Date !== null? `\/Date(${this.inPatientPhdisDataSet.value.Date.getTime()})\/`: null
    })
    const saveDataList = {
      patientFormData: this.inPatientPhdisDataSet.value,
      releaseForm: true
    };
    this.inPatientConfigurationService.saveInPatientPhdisData(saveDataList, this.dischargeSummaryConfiguration[0], this.userConfig).subscribe((resp) => {
      this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
      // this.inPatientConfigurationService.postReleasePhdisForm(resp).subscribe((resp) => {
      //   this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
      // })
    });

    this.updateEvent.emit(true);
  }

  deletePhdisForm() {
    this.inPatientConfigurationService.deleteInPatientPhdisData(this.inPatientDataObj.Dockey)
  }

  releaseForm() {
    this.formatePayloadDateTime();
    this.saveReleaseGeneratePayload();
    const saveDataList = {
      patientFormData: this.inPatientFormInput === "OPERT" ? this.inPatientDataSet.value : this.inPatientOrrptDataSet.value,
      surgeryData: this.surgeryTableData && this.surgeryTableData.length ? this.surgeryTableData : [],
      preDiganosisData: this.preDiagnosisTableData && this.preDiagnosisTableData.length ? this.preDiagnosisTableData : [],
      postDiagnosisData: this.postDiagnosisTableData && this.postDiagnosisTableData.length ? this.postDiagnosisTableData : [],
      patientDtId: this.getPatientDtId()
    };
    this.inPatientConfigurationService.saveInPatientDocumentData(saveDataList, this.userConfig, true)
    this.updateEvent.emit(true);
  }

  deleteForm() {
    this.inPatientConfigurationService.deleteInPatientData(this.inPatientDataObj.DocKey);
    this.updateEvent.emit(true);
  }

  formatePayloadDateTime() {
    this.onChangeDate(this.inPatientOrrptDataSet.get('DateOfSurgery').value, "DateOfSurgery");
    this.onChangeDate(this.inPatientOrrptDataSet.get('DateOfReportEntry').value, "DateOfReportEntry");

    this.onChangeTime(this.inPatientOrrptDataSet.get('TimeOfSurgery').value, "TimeOfSurgery");
    this.onChangeTime(this.inPatientOrrptDataSet.get('TimeOfReportEntry').value, "TimeOfReportEntry");
  }

  closeInPatientForm() {
    this.selectedPatient = '';
    this.admissionService.selectedCurrentDocDetails = '';
    this.admissionService.isClonePhysicianForm = false;
    this.admissionService.isEditPhysicianForm = false;
    this.onClose.emit({ isvalid: true, isinvalid: false })
  }

  unsubscriptionData() {
    if (this.surgerySubscription) { this.surgerySubscription.unsubscribe(); }
    if (this.preDiagnosisSubscription) { this.preDiagnosisSubscription.unsubscribe(); }
    if (this.postDiagnosisSubscription) { this.postDiagnosisSubscription.unsubscribe(); }
  }

  // [region] start SurgeryData

  loadSurgeyPopupData() {
    this.inPatientConfigurationService.getSurgeryPopupData(this.paramsObject).subscribe((surgeryData: any) => {
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
    })
  }

  onOpenSurgeryPopup() {
    this.unsubscriptionData();
    const headerData = [
      { columnTitle: "Code", fieldName: 'Code', class: 'w-15', disabled: true },
      { columnTitle: "Description", fieldName: 'Description', class: 'w-30', disabled: true },
      { columnTitle: "Employee", fieldName: 'EmployeeResponsible', class: 'w-25', disabled: true },
      { columnTitle: "Employee Name", fieldName: 'EmployeeName', class: 'w-30', disabled: true }
    ];
    this.loadSurgeyPopupData();
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
  }

  // [region] End SurgeryData


  // [region] start Diagnosis
  loadDiagnosisData() {
    this.inPatientConfigurationService.getDiagnosisPopupData(this.paramsObject).subscribe((diagnosesData: DiagnosesData[]) => {
      diagnosesData.forEach((item, index) => {
        item.DocKey = "";
        item.Remarks = "";
        item.AdmissionDxInd = false;
        item.DischargeDxInd = false;
        item.WorkingDxInd = false;
        item.PreoperativeDxInd = false;
        item.SurgeryDxInd = false;
        item.CauseOfDeathInd = false;
        item.DepartmentMainDxInd = false;
        item.DiagnosesOrder = index + 1;
      });
      this.diagnosisData = diagnosesData;
    })
  }

  onPreOperativePopup() {
    this.unsubscriptionData();
    const headerData = [
      { columnTitle: "Diagnosis Code", fieldName: 'Code', class: 'w-20', disabled: true },
      { columnTitle: "Diagnosis Description", fieldName: 'Description', class: 'w-50', disabled: true },
      { columnTitle: "Comments", fieldName: 'Remarks', class: 'w-30', disabled: false },
    ];
    this.loadDiagnosisData();
    this.configPopup.showPopup(headerData, this.diagnosisData, 'in-patient-template');
    if (this.preDiagnosisSubscription) { this.preDiagnosisSubscription.unsubscribe() };
    this.preDiagnosisSubscription = this.configPopup.onClose.subscribe((data) => {
      if (data && data.length) {
        data.forEach((item) => {
          this.preDiagnosisTableData.push(item);
        })
      }
      this.preDiagnosisSubscription.unsubscribe();
    })
  }

  onPostOperativePopup() {
    this.unsubscriptionData();
    const headerData = [
      { columnTitle: "Diagnosis Code", fieldName: 'Code', class: 'w-20', disabled: true },
      { columnTitle: "Diagnosis Description", fieldName: 'Description', class: 'w-50', disabled: true },
      { columnTitle: "Comments", fieldName: 'Remarks', class: 'w-30', disabled: false },
    ];
    this.loadDiagnosisData();
    this.configPopup.showPopup(headerData, this.diagnosisData, 'in-patient-template');
    if (this.postDiagnosisSubscription) { this.postDiagnosisSubscription.unsubscribe() };
    this.postDiagnosisSubscription = this.configPopup.onClose.subscribe((data) => {
      if (data && data.length) {
        data.forEach((item) => {
          this.postDiagnosisTableData.push(item);
        })
      }
      this.postDiagnosisSubscription.unsubscribe()
    })
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
        const hours = +(strArr[2] + strArr[3]) <= 9 ? `0${+(strArr[2] + strArr[3])}` : +(strArr[2] + strArr[3]);
        const Minute = +(strArr[5] + strArr[6]) <= 9 ? `0${+(strArr[5] + strArr[6])}` : +(strArr[5] + strArr[6]);
        const Second = +(strArr[8] + strArr[9]) <= 9 ? `0${+(strArr[8] + strArr[9])}` : +(strArr[8] + strArr[9]);
        return `${hours}:${Minute}:${Second}`
      }
    }
    return null;
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (
        data &&
        data.length === 8
      ) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }

  parseDate(date: string) {
    if (date) {
      return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
    }
  }
  onChangeOtherOption(data: any) {
    data.DischargeDisposition === "4" ? this.isDisabledOther = false : this.isDisabledOther = true;
  }
  // [region] End Diagnosis
  ngOnDestroy(): void {
    if (this.surgerySubscription) { this.surgerySubscription.unsubscribe() };
    if (this.preDiagnosisSubscription) { this.preDiagnosisSubscription.unsubscribe() };
    if (this.postDiagnosisSubscription) { this.postDiagnosisSubscription.unsubscribe() };
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  updateForm(event) {
    this.updateEvent.next(true);
  }
}


