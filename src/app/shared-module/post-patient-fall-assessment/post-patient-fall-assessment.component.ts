import { Component, OnInit, ViewChild } from '@angular/core';
import { DiagnosisTabComponent } from './diagnosis-tab/diagnosis-tab.component';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '@services/storage.service';
import { DataShareService } from '@services/data-share.service';
import { DatePipe } from '@angular/common';
import { SharedService } from '@services/shared.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { ActionType } from '@services/interfaces/common.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-post-patient-fall-assessment',
  templateUrl: './post-patient-fall-assessment.component.html',
  styleUrls: ['./post-patient-fall-assessment.component.scss']
})
export class PostPatientFallAssessmentComponent implements OnInit {

  selectedTabName: string = 'Assessed by Nurse';

  tabList = ['Assessed by Nurse', 'Diagnosis', 'Vital Sign Prior to Fall', 'Vital Sign at the time of Fall'];
  @ViewChild('diagnosisNotesKardexId') diagnosisNotesKardex: DiagnosisTabComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;

  assistiveList = [
    {
      label: 'Yes',
      value: '0'
    },
    {
      label: 'No',
      value: '1'
    },
  ]
  observedList = [
    {
      label: 'NA',
      value: '0'
    },
    {
      label: 'Yes',
      value: '1'
    },
    {
      label: 'No',
      value: '2'
    },
  ]
  formSurgicalPaasDetailGroup: FormGroup;
  cprForm: FormGroup;
  TOOBSERVATION: FormArray;

  modalRefUpdateName: BsModalRef;

  payloadJson: any = {}

  public isCheckedDiagnosis: any;
  public toDiagnosisArr: any = [];
  public duplicates: any = [];
  public toVitalsArr: any = [];
  public drugArray: any = [];
  public medicationImportDrugArray: any[] = [];
  public selectedMedicationOrder: any = [];

  isChecked: any;
  paramsObject: any;
  encounterId: any;
  docKey: any;

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(private formBuilder: FormBuilder, private _route: ActivatedRoute, public storageService: StorageService,
    private modalService: BsModalService, public ePrescriptionService: EPrescriptionService, private dataShareService: DataShareService,
    private dayCaseDashboard: DayCaseDashboardService, private sharedService: SharedService, private datePipe: DatePipe,
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId = this.paramsObject.einri + this.paramsObject.falnr + this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
      // this.getPatinetDetails(this.encounterId);
    });

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        console.log(data, "data");

        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            console.log(this.docKey, "this.docKey");
            // this.getNursingAdmissionDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            console.log(this.docKey, "this.docKey");
            // this.getNursingAdmissionDocDetails(data.value.docKey);
          }
        }
      }
    );
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


  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    console.log(currentTime);

    this.cprForm = this.formBuilder.group({
      Dockey: "",
      Dtid: "ZMED_CPR",
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      Location: "",
      TypeArrest: "",
      TypeArrestTxt: "",
      DateArrest: new Date(),
      TimeArrest: "",
      TimeCode: "",
      CodeActivate: "",
      RequestApproved: "",
      HDm: false,
      HHtn: false,
      HCva: false,
      HCa: false,
      HHf: false,
      HRf: false,
      Arrest: "",
      InitialRhythm: "",
      IvLine: "",
      NewlyInserted: "",
      PreviouslyInserted: "",
      Respiratory: "",
      RespiratoryTm: "",
      Anesthesia: "",
      AnesthesiaTm: "",
      Compression: "",
      CompressionTm: "",
      IvIoMed: "",
      IvIoMedTm: "",
      Defibrillator: "",
      DefibrillatorTm: "",
      Nursing: "",
      NursingTm: "",
      TeamLeader: "",
      TeamLeaderTm: "",
      Unresponsive: "",
      Breathing: "",
      PulsePresent: "",
      Cyanotic: "",
      PupilsDilated: "",
      Seizure: "",
      HistorySeizures: "",
      ChestCompression: "",
      Note: "",
      LeadsPlace: "",
      MonitorActive: "",
      Cannula1: "",
      Cannula2: "",
      Infusion1: "",
      Infusion2: "",
      Note1: "",
      LSites: "",
      LAttempts: "",
      LType: "",
      LSize: "",
      VentilationBy: "",
      VentilationTxt: "",
      Ventilation: "",
      Intubation: "",
      Fio2: "",
      EttPlaced: "",
      EttSize: "",
      EttDepth: "",
      EttIsPlaced: "",
      EttIsPlacedBy: "",
      ToothDamage: "",
      Bleeding: "",
      Vomiting: "",
      Terminated: "",
      Disposition: "",
      Transferred: "",
      TransferredTm: "",
      DeclaredExpired: "",
      DeclaredExpiredTm: "",
      Autopsy: "",
      FamilyInformed: "",
      FDate: new Date(),
      FTime: "",
      NamePhysician: "",
      EcgStrip: "",
      AttachedBy: "",
      WitnessedBy: "",
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: "1",
      TOOBSERVATION: new FormArray([])
    });

    for (let index = 0; index < 10; index++) {
      this.addItem();
    }
  }

  addItem(data?: any): void {
    if (this.cprForm) {
      this.TOOBSERVATION = this.cprForm.get('TOOBSERVATION') as FormArray;
      // this.TOOBSERVATION.push(this.createObservation(data));
    }
  }


  selectTab(tabName: string) {
    this.selectedTabName = tabName;
  }

  public handleCheckboxDiagnosis(event) {
    this.isCheckedDiagnosis = event.target.checked;
    this.formSurgicalPaasDetailGroup.get('isDiagnosis')?.setValue(this.isCheckedDiagnosis);
  }


  public openModalForDiagnosis() {
    if (this.isCheckedDiagnosis) return
    this.diagnosisNotesKardex.openModalForDiagnosisKardex();
  }

  public deleteDiagnosisFromTable(index: number) {
    if (index > -1) {
      this.toDiagnosisArr.splice(index, 1);
    }
  }


  public openModalVital() {
    if (this.isChecked) return;
    const item = {
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Patient: this.storageService?.patientData?.name,
      admissionDate: this.storageService.patientData.periodStart,
    };
    this.erVitalsModal.openModalForErVital(item);
  }

  public deleteVitalsFromTable(index: number) {
    if (index > -1) {
      this.toVitalsArr.splice(index, 1);
    }
  }

  public handleCheckboxVitals(event) {
    this.isChecked = event.target.checked;
    // this.preCardiacForm.get('isVitals')?.setValue(this.isChecked);
  }

  importDiagnosisData(data) {
    data.forEach((el) => {
      this.toDiagnosisArr = this.toDiagnosisArr.concat({
        Dockey: '',
        DCode: el.DiagKey1,
        DDescription: el.DiagShorttext,
        DRemarks: el.DiagText,
        DAdmission: el.AdmissionDia,
        DDischarge: el.DischargeDia,
        DWorking: el.WorkDiagInd,
        DPreoperative: el.PreopDiagInd,
        DSurgery: el.SurgeryDia,
        DDeath: el.CauseOfDeath,
        DDepartment: el.DeptMainDia,
        DHospital: el.HospMainDia,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesDiagnosis();
    this.toDiagnosisArr = this.toDiagnosisArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.DCode === value.DCode)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesDiagnosis();
    }
  }

  findDuplicatesDiagnosis() {
    let tempArr = [];
    const lookup = this.toDiagnosisArr.reduce((a, e) => {
      a[e.DCode] = ++a[e.DCode] || 0;
      return a;
    }, {});
    tempArr = this.toDiagnosisArr.filter((e) => lookup[e.DCode]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.DCode === value.DCode)
    );
  }
  errorMsgForDuplicatesDiagnosis() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.DCode);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup',
    });
  }

  public importVitalsData(data) {
    data.forEach((el) => {
      this.toVitalsArr = this.toVitalsArr.concat({
        Dockey: '',
        Vdescription: el.Name,
        MeasuredValue: el.ValueFormatted,
        NormalRange: el.NormalRange,
        DateTime: `${new DatePipe('en-US').transform(
          this.getDate(el.Date),
          'dd.MM.yyyy'
        )}/${this.parseTime(el.Time)}`,
        Vunit: el.UnitTxt,
      });
    });
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

}
