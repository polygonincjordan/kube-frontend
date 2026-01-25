import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { InPatientConfigurationService } from '@services/e-kardex/inPatient.service';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { StorageService } from '@services/storage.service';
import Swal from 'sweetalert2';
import { GynDiagnosisComponent } from '../obs-gyn/diagnosis/diagnosis.component';
import { SharedService } from '@services/shared.service';
import { OrderType } from '@services/interfaces/common.enum';
import { DocsService } from '@services/docs.service';
@Component({
  selector: 'app-discharge-summary',
  templateUrl: './discharge-summary.component.html',
  styleUrls: ['./discharge-summary.component.scss'],
})
export class DischargeSummaryComponent implements OnInit, OnChanges {
  @Input() soapFormEvent: string;
  @Output() reloadTableList = new EventEmitter();
  @ViewChild('diagnosisNotesKardexId') diagnosisNotesKardex: GynDiagnosisComponent;
  
  orderType = OrderType;
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
    private inPatientConfigurationService: InPatientConfigurationService,
    private modalService: BsModalService,
    public storageService: StorageService,
    public ePrescriptionService: EPrescriptionService,
    public sharedService: SharedService,
    private docsService: DocsService

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
    if (this.admissionService.isCloneDischargeSummery || this.admissionService.isEditDischargeSummery) {
      if (!this.isCheckAPICall) {
        this.getDichargeDataByDockey(false);
      }
    }
  }

  getDichargeDataByDockey(isRelease) {
    this.inPatientConfigurationService.getPatientSummaryDataByDocKey(this.admissionService.selectedCurrentDocDetails.Dockey).subscribe((resp) => {
      if (resp && resp.results && resp.results.length) {
        this.inPatientDischargeData = resp.results[0];
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
        this.toDiagnosisArr = this.inPatientDischargeData.ToDiagnosis.results;
        this.medicationImportDrugArray = this.inPatientDischargeData.ToDischargeMed.results;
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
    // if(this.admissionService.isCloneDischargeSummery) {
    //   this.inPatientPhdisDataSet.value.Dockey = '';  
    // }
    // this.inPatientPhdisDataSet.patchValue({
    //   Time: this.parsePayloadFormateTime(this.inPatientPhdisDataSet.value.Time),
    // });

    let payloadDicharge = this.inPatientPhdisDataSet.value;
    payloadDicharge.Time = this.parsePayloadFormateTime(payloadDicharge.Time)
    payloadDicharge.Date = payloadDicharge.Date !== undefined && payloadDicharge.Date !== null
      ? this.sanitizeSAPDateFormat(payloadDicharge.Date)
      : null;

    payloadDicharge['ToDiagnosis'] = this.toDiagnosisArr;
    payloadDicharge['ToDischargeMed'] = this.medicationImportDrugArray;

    console.log(payloadDicharge, "payloadDicharge")
    const saveDataList = {
      patientFormData: payloadDicharge,
      releaseForm: isRelease,
    };
    this.admissionService
      .saveInPatientPhdisData(
        saveDataList,
        this.userConfig,
        this.paramsObj,
        'physicianDischargeSumm'
      )
      .subscribe((resp) => {
        // if (this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') {
        //   this.reloadTableList.next(true);
        //   this.admissionService.cancelAllForm();
        // }
        this.reloadTableList.next(true);
        this.admissionService.cancelAllForm();
        this.admissionService.clearSoapEvent.next(true);
        this.admissionService.isEditDischargeSummery = false;
        this.admissionService.isCloneDischargeSummery = false;
        this.docsService.showSuccessMsg(this.soapFormEvent,'Physician Discharge Summary');
      }, (error: any) => {
        this.admissionService.clearSoapEvent.next(true);
        this.admissionService.isCloneNicuForm = false;
        this.admissionService.isEditNicuForm = false;
        this.docsService.showErrorMsg(error);
      });
    // this.updateEvent.emit(true);
  }

  updatePhysicianDischarge(isRelease) {
    let payload: any = this.inPatientPhdisDataSet.value;
    // this.inPatientPhdisDataSet.patchValue({
    payload.Time = this.parsePayloadFormateTime(payload.Time),
      payload.Date = payload.Date !== undefined && payload.Date !== null
        ? this.sanitizeSAPDateFormat(payload.Date)
        : null;
    // });
    const saveDataList = {
      patientFormData: payload.Time,
      releaseForm: isRelease,
    };
    this.admissionService
      .updateInPatientPhdisData(
        saveDataList,
        this.userConfig,
        this.paramsObj
      )
      .subscribe((resp) => {
        this.reloadTableList.next(true);
        this.admissionService.cancelAllForm();
        this.admissionService.clearSoapEvent.next(true);
        // this.inPatientConfigurationService.getListOfAllPatientVisitDataSet();
      }, (error: any) => {
        this.admissionService.clearSoapEvent.next(true);
      });
    // this.updateEvent.emit(true);
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
      EvolutionSummary: new FormControl(''),
      RelevantResultsAdm: new FormControl(''),
      PhysicalExaminationDischarge: new FormControl(''),
      MgmtTreatmentPlan: new FormControl(''),
      MgmtRecommendations: new FormControl(''),
      DischargeCondition: new FormControl(''),
      Date: new FormControl(null),
      Time: new FormControl(this.parseTime(this.datePipe.transform(new Date(), "hh:mm:ss"))),
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

  handleCheckboxVitals() {
    throw new Error('Method not implemented.');
  }

  modalRefUpdateName: BsModalRef;
  selectedMedicationOrder: any[] = [];
  drugArray: any[] = [];
  medicationImportDrugArray: any;
  toDiagnosisArr: any = [];
  duplicates: any = [];

  openModal(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class:
        'modal-dialog modal-dialog-centered medication-order-case modal-xl',
    };
    this.modalRefUpdateName = this.modalService.show(template, config);
    this.loadMedicationHistoryData();
    // this.medicationImportDrugArray=[];
  }

  loadMedicationHistoryData() {
    this.selectedMedicationOrder = [];
    this.drugArray = [];
    const profileOrderHistory: Subscription = this.ePrescriptionService
      .loadData(
        `e-prescription/OrderHistorylist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}`,
        false,
        false,
        false,
        false
      )
      .subscribe(
        (resp: any) => {
          if (
            resp.body &&
            resp.body.d &&
            resp.body.d.results &&
            resp.body.d.results.length
          ) {
            //this.configurationData = resp.body.d.results;
            this.drugArray = resp.body.d.results;
            // this.medicationImportDrugArray=[];
          }
          //   this.filterEvents();
        },
        () => {
          profileOrderHistory.unsubscribe();
        }
      );
  }

  medicationImport() {
    if (!this.medicationImportDrugArray) {
      this.medicationImportDrugArray = [];
    }

    this.selectedMedicationOrder.forEach((element) => {
      this.medicationImportDrugArray.push({
        Dockey: '',
        OrderType:
          element.MotypId == '30' ? 'Planned Administration' : 'Discharge',
        OrderDesc:
          element.Descrlt +
          element.Quan +
          element.Quanunit +
          element.Routedescr +
          element.N1id,
        HomeMedication: false,
        OwnMedication: false,
        Dose: element.Quan + element.Quanunit,
        Validity: `${new DatePipe('en-US').transform(
          this.getDate(element.StartD),
          'dd.MM.yyyy'
        )}-${new DatePipe('en-US').transform(
          this.getDate(element.EndD),
          'dd.MM.yyyy'
        )}`,
        Route: element.Routedescr,
        Amount: '',
        Rate: '',
        RecommendedTherapy: '00000',
        Id: null,
        OrderingPhysician: element.EmpRespNm,
        Cycle: element.N1id,
      });
    });
    this.modalRefUpdateName.hide();
  }
  collectAllMedicationIData(event: any) {
    if (event.target.checked) {
      this.selectedMedicationOrder = Object.assign([], this.drugArray);
    } else {
      this.selectedMedicationOrder = [];
    }
  }
  isChecked(item: any): boolean {
    return this.selectedMedicationOrder.some((x) => x.Meordid == item.Meordid);
  }

  collectMedicationIData(event, item) {
    if (event.target.checked) {
      this.selectedMedicationOrder.push(item);
      // this.medicationImportDrugArray.push(item);
    } else {
      const indexOf = this.selectedMedicationOrder.findIndex(
        (x) => x.Meordid == item.Meordid
      );
      if (indexOf !== -1) this.selectedMedicationOrder.splice(indexOf, 1);
      // this.medicationImportDrugArray.splice(index, 1);
    }
  }




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
