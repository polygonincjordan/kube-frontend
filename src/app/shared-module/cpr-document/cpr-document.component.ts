import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DiagnosisTabComponent } from './diagnosis-tab/diagnosis-tab.component';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '@services/storage.service';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { DatePipe } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { DataShareService } from '@services/data-share.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'app-cpr-document',
  templateUrl: './cpr-document.component.html',
  styleUrls: ['./cpr-document.component.scss']
})
export class CprDocumentComponent implements OnInit {
  @ViewChild('diagnosisNotesKardexId') diagnosisNotesKardex: DiagnosisTabComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;

  formSurgicalPaasDetailGroup: FormGroup;
  cprForm: FormGroup;
  modalRefUpdateName: BsModalRef;


  tabList = [
    'Cardiopulmonary Resuscitation',
    'Diagnosis',
    'CPR Medication',
    'Vitals',
    'Condition of patient on Code Team arrival',
    'Observation',
  ];

  public selectedTabName: string = 'Cardiopulmonary Resuscitation';
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
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getNursingAdmissionDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getNursingAdmissionDocDetails(data.value.docKey);
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
      TimeArrest: currentTime,
      TimeCode: "",
      CodeActivate: currentTime,
      RequestApproved: ",",
      HDm: true,
      HHtn: true,
      HCva: true,
      HCa: true,
      HHf: true,
      HRf: true,
      Arrest: "",
      InitialRhythm: "",
      IvLine: "",
      NewlyInserted: "",
      PreviouslyInserted: "",
      Respiratory: "",
      RespiratoryTm: currentTime,
      Anesthesia: "",
      AnesthesiaTm: currentTime,
      Compression: "",
      CompressionTm: currentTime,
      IvIoMed: "",
      IvIoMedTm: currentTime,
      Defibrillator: "",
      DefibrillatorTm: currentTime,
      Nursing: "",
      NursingTm: currentTime,
      TeamLeader: "",
      TeamLeaderTm: currentTime,
      Unresponsive: "",
      Breathing: "",
      PulsePresent: "",
      Cyanotic: "",
      PupilsDilated: "",
      Seizure: "",
      HistorySeizures: "",
      ChestCompression: currentTime,
      Note: "",
      LeadsPlace: currentTime,
      MonitorActive: currentTime,
      Cannula1: currentTime,
      Cannula2: currentTime,
      Infusion1: currentTime,
      Infusion2: currentTime,
      Note1: "",
      LSites: "",
      LAttempts: "",
      LType: "",
      LSize: "",
      VentilationBy: "",
      VentilationTxt: "",
      Ventilation: currentTime,
      Intubation: currentTime,
      Fio2: "",
      EttPlaced: "",
      EttSize: "",
      EttDepth: "",
      EttIsPlaced: "",
      EttIsPlacedBy: "",
      ToothDamage: "",
      Bleeding: "",
      Vomiting: "",
      Terminated: currentTime,
      Disposition: "",
      Transferred: "",
      TransferredTm: currentTime,
      DeclaredExpired: currentTime,
      DeclaredExpiredTm: currentTime,
      Autopsy: "",
      FamilyInformed: "",
      FDate: new Date(),
      FTime: currentTime,
      NamePhysician: "",
      EcgStrip: "",
      AttachedBy: "",
      WitnessedBy: "",
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: "1",
    })
  }

  getNursingAdmissionDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .fetcCprDocDetails(docKey)
      .subscribe({
        next: (data: any) => {
          this.cprForm.patchValue(data.d.results[0]);
          // this.nursingAdmissionForm.patchValue({
          //   ADate: this.parseDate(data.d.results[0].ADate),
          //   ATime: this.parseTime(data.d.results[0].ATime),
          // });

          // if (data?.d?.results[0].TOSCALE.results.length) {
          //   // Sort the array in descending order based on Datetimee (as a string)
          //   let sortedScales = data.d.results[0].TOSCALE.results.sort((a, b) =>
          //     b.Datetimee.localeCompare(a.Datetimee)
          //   );

          //   // Create a map to store only the latest record for each ScaleType
          //   let latestScalesMap = new Map();
          //   sortedScales.forEach(item => {
          //     if (!latestScalesMap.has(item.ScaleType)) {
          //       latestScalesMap.set(item.ScaleType, item);
          //     }
          //   });

          //   // Convert map values to an array (only latest records per ScaleType)
          //   let latestScales = Array.from(latestScalesMap.values());

          //   // Update scalesList with the latest values
          //   latestScales.forEach(element => {
          //     let existingScale = this.scalesList.find(res => res.ScaleType === element.ScaleType);
          //     if (existingScale) {
          //       existingScale.Datetimee = element.Datetimee;
          //       existingScale.Dockey = element.Dockey;
          //       existingScale.ScoreDesc = element.ScoreDesc;
          //       existingScale.LastScore = element.LastScore;
          //     }
          //   });
          // }

          // console.log(this.scalesList, "scalesList")
          // this.bindDataToFormArray(data?.d?.results[0].TOINFECTION.results)
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing care plans: ${err}`
          );
        },
      });
  }

  assessmentTabSelect(tabName: string) {
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



  public handleCheckboxVitals(event) {
    this.isChecked = event.target.checked;
    // this.preCardiacForm.get('isVitals')?.setValue(this.isChecked);
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
    const profileOrderHistory: Subscription = this.ePrescriptionService.loadData(`e-prescription/OrderHistorylist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        //this.configurationData = resp.body.d.results;
        this.drugArray = resp.body.d.results;
        // this.medicationImportDrugArray=[];

      }
      //   this.filterEvents();
    }, () => { profileOrderHistory.unsubscribe(); });
  }


  medicationImport() {
    // this.medicationImportDrugArray =  this.drugArray ;
    // this.drugArray.forEach(element => {
    this.selectedMedicationOrder.forEach(element => {
      this.medicationImportDrugArray = this.medicationImportDrugArray.concat({
        "Dockey": "",
        "OrderType": element.MotypId == '30' ? 'Planned Administration' : 'Discharge',
        "Description": element.Descrlt + element.Quan + element.Quanunit + element.Routedescr + element.N1id,
        "HomeMedication": false,
        "PatientOwnMed": false,
        "Dose": element.Quan + element.Quanunit,
        "Validity": `${new DatePipe('en-US').transform(
          this.getDate(element.StartD),
          'dd.MM.yyyy'
        )}` + '-' + `${new DatePipe('en-US').transform(
          this.getDate(element.EndD),
          'dd.MM.yyyy'
        )}`,
        "Route": element.Routedescr,
        "Amount": "",
        "Rate": "",
        "Therapy": "00000",
        "Id": "",
        "OrderingPhysician": element.EmpRespNm,
        "Cycle": element.N1id
      });
    });
    this.modalRefUpdateName.hide();
  }


  collectAllMedicationIData(event: any) {
    if (event.target.checked) {
      this.selectedMedicationOrder = (Object.assign([], this.drugArray));
    } else {
      this.selectedMedicationOrder = [];
    }
  }

  collectMedicationIData(event, item) {
    if (event.target.checked) {
      this.selectedMedicationOrder.push(item);
      // this.medicationImportDrugArray.push(item); 
    } else {
      const indexOf = this.selectedMedicationOrder.findIndex(x => x.Meordid == item.Meordid);
      if (indexOf !== -1)
        this.selectedMedicationOrder.splice(indexOf, 1);
      // this.medicationImportDrugArray.splice(index, 1);
    }
  }

  isCheckedForMedication(item: any): boolean {
    return this.selectedMedicationOrder.some(x => x.Meordid == item.Meordid);
  }
  isFormValidError = false
  createCPRDocument(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      this.isFormValidError = true;
      if (this.cprForm.invalid) {
        return;
      }
      this.cprForm.value.DocStatus = docStatus;
      let paylaod = this.cprForm.value;
      if(this.cprForm.value.DateArrest) paylaod.DateArrest = this.cprForm.value.DateArrest.toISOString().split('T')[0] + "T00:00:00";
      if(this.cprForm.value.FDate) paylaod.FDate = this.cprForm.value.FDate.toISOString().split('T')[0] + "T00:00:00";

      paylaod.RAt = this.parsePayloadFormateTime(this.cprForm.value.RAt);
      let timeFields = [
        "TimeArrest", "TimeCode", "RespiratoryTm", "AnesthesiaTm", 
        "CompressionTm", "IvIoMedTm", "DefibrillatorTm", "NursingTm", 
        "TeamLeaderTm", "ChestCompression", "LeadsPlace", "MonitorActive", 
        "Cannula1", "Cannula2", "Infusion1", "Infusion2", "Ventilation", 
        "Intubation", "Terminated", "TransferredTm", "DeclaredExpired", 
        "DeclaredExpiredTm", "FTime"
      ];
      
      // Update the form fields with the converted values
      timeFields.forEach(field => {
        let currentValue = this.cprForm.get(field)?.value;
        paylaod[field] = this.parsePayloadFormateTime(currentValue);
      });

      // paylaod.TOSCALE = this.scalesList.filter((res: any) => {
      //   delete res.value;
      //   res.LastScore = res?.LastScore.toString();
      //   if(res.LastScore) {
      //     return res;
      //   }
      // });

      paylaod.Orgdo = this.storageService?.patientData?.deptOrgUnit;
      this.subscription = this.dayCaseDashboard
        .saveCprDocument(paylaod)
        .subscribe({
          next: (data: any) => { },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `PUT Error at Nursing assessment document : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            if (actiontype === 'edit') {
              this.sharedService.successSwallModel(
                'Nursing assessment document updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Nursing assessment document created successfully'
              );
            }
          },
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

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data && data.length === 8) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
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

}
