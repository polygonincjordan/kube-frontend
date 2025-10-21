import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AdmissionService } from '@services/admission/admission.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { PhysicianCreateAllergyComponent } from './physician-create-allergy/physician-create-allergy.component';
import { PhysicianErVitalsComponent } from './physician-er-vitals/physician-er-vitals.component';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { PatientService } from '@services/e-kardex/patient.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { ScalesGlosgowComaComponent } from './scales-glosgow-coma/scales-glosgow-coma.component';
import { ScalesFacePainComponent } from './scales-face-pain/scales-face-pain.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ScalesNumericRatingComponent } from './scales-numeric-rating/scales-numeric-rating.component';
import { SharedService } from '@services/shared.service';
import { AddHabitSocialComponent } from './add-habit-social/add-habit-social.component';

@UntilDestroy()
@Component({
  selector: 'app-er-triage',
  templateUrl: './er-triage.component.html',
  styleUrls: ['./er-triage.component.scss'],
})
export class ErTriageComponent implements OnInit {
  @ViewChild('allergyModal', { static: true }) allergyModal: TemplateRef<any>;
  @ViewChild('createAllergyId') createAllergyId: PhysicianCreateAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: PhysicianErVitalsComponent;
  @ViewChild('scalesGlosgow') scalesGlosgow: ScalesGlosgowComaComponent;
  @ViewChild('scalesFacePain') scalesFacePain: ScalesFacePainComponent;
  @ViewChild('scalesNumericRating') scalesNumericRating: ScalesNumericRatingComponent;
  @ViewChild('socialAddHabit') socialAddHabit: AddHabitSocialComponent;

  triageForm: FormGroup;
  modalRefForAllergy: BsModalRef;

  allergy: boolean = true;
  diagnosis: boolean = false;
  vitals: boolean = false;
  enableCreateVitals: boolean = false;
  enableCreateDiagnosis: boolean = false;
  noScaleAppicable: boolean = false;
  psychologicalHistory: boolean = false;
  socialHistory: boolean = true;
  noHabitApplicable: boolean = false;

  modeArrivalList = [
    { value: '0', label: 'Stretcher' },
    { value: '1', label: 'Ambulatory' },
    { value: '2', label: 'Wheel Chair' },
    { value: '3', label: 'Carried' },
    { value: '4', label: 'Cuddled' },
    { value: '5', label: 'Other' },
  ];
  accompaniedList = [
    { value: '0', label: 'Spouse' },
    { value: '1', label: 'Relative' },
    { value: '2', label: 'Parents' },
    { value: '3', label: 'Guardian' },
    { value: '4', label: 'Police Officer' },
    { value: '5', label: 'Civil Defence' },
    { value: '6', label: 'Other' },
  ];
  triageList = [
    {
      value: '0',
      label: 'Level I Resuscritation',
      TriagePriorityCode: '01',
      TriageColor: 'blue',
    },
    {
      value: '1',
      label: 'Level II Emergency',
      TriagePriorityCode: '02',
      TriageColor: 'red',
    },
    {
      value: '2',
      label: 'Level III Urgency',
      TriagePriorityCode: '03',
      TriageColor: 'yellow',
    },
    {
      value: '3',
      label: 'Level IV Less Urgency',
      TriagePriorityCode: '04',
      TriageColor: 'green',
    },
    {
      value: '4',
      label: 'Level V Non Urgency',
      TriagePriorityCode: '05',
      TriageColor: 'white',
    },
  ];

  scalesList = [];
  socialHistoryList = [];
  toAllergyArr: any = [];
  toDiagnosisArr: any = [];
  toVitalsArr: any = [];
  duplicates: any = [];
  encounterId: any;
  selectedTableDetails: any;
  selectedTriageDetails: any;
  patientDetails: Patient;
  maritalStatus: any;
  socialHabitList: any[];
  Zversion: string;
  ZMode: string = "I";

  public triagePriorities: any[] = [
    { value: '01', label: 'Resuscitation', backgroundColor: 'blue', borderColor: '#cacaca', fontColor: 'white' },
    { value: '02', label: 'Emergency', backgroundColor: 'red', borderColor: '#cacaca', fontColor: 'white' },
    { value: '03', label: 'Urgency', backgroundColor: 'yellow', borderColor: '#cacaca', fontColor: 'black' },
    { value: '04', label: 'Less Urgency', backgroundColor: 'green', borderColor: '#cacaca', fontColor: 'white' },
    { value: '05', label: 'Non Urgency', backgroundColor: 'white', borderColor: '#cacaca', fontColor: 'black' }
  ];

  constructor(
    private modalService: BsModalService,
    private admissionService: AdmissionService,
    private emergencyService: EmergencyService,
    public storageService: StorageService,
    private patientService: PatientService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    // this.openModalForMain();
  }

  public openModalForMain(data?: any, documentStatus?: any, triageDetails?: any) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl allergy-modal-size allergy-model-height',
      ignoreBackdropClick: true,
    };
    this.toAllergyArr = [];
    this.toVitalsArr = [];
    this.scalesList = [
      { ScaleType: 'Glasgow Coma Scale', LastScore: '', description: '', Datetimee: '', value: '1', Dockey: '', },
      { ScaleType: 'Face pain scale', LastScore: '', description: '', Datetimee: '', value: '2', Dockey: '', },
      { ScaleType: 'Numeric rating scale(more than 8 years)', LastScore: '', description: '', Datetimee: '', value: '3', Dockey: '', },
    ];
    this.socialHistoryList = [
      { Habitid: '', value: '0', label: 'Alcohol', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, },
      { value: '1', label: 'Drugs', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
      { value: '2', label: 'Tobacco', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
      { value: '3', label: 'Other', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
    ];
    this.modalRefForAllergy = this.modalService.show(this.allergyModal, config);

    this.selectedTableDetails = data;
    if (data.Lfdbw) {
      this.encounterId = data.Einri + data.Falnr + data.Lfdbw;
    } else {
      this.encounterId = data.Einri + data.Falnr + data.Lfdnr;
    }
    this.selectedTableDetails.Einri = this.selectedTableDetails.Institute;
    this.selectedTableDetails.Falnr = this.selectedTableDetails.CaseNumber;
    this.selectedTableDetails.Patnr = this.selectedTableDetails.Mrn;
    
    this.storageService.setEinri(data.Einri);
    this.storageService.setFalnr(data.Falnr);
    this.storageService.setLfdnr(data.Lfdbw ? data.Lfdbw : data.Lfdnr);
    this.storageService.setPatnr(data.Patnr);
    this.selectedTriageDetails = triageDetails;
    if (documentStatus) {
      this.Zversion = documentStatus.Zversion;
      this.ZMode = 'U';
      this.statusDraftDocDetails(documentStatus);
    };
    this.getDataPatient();
    this.initForm();
    this.getSocialHistoryHabitList();
  }

  // patient detail API
  getDataPatient() {
    this.patientService
      .getDataPatient(this.encounterId)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of({} as Patient);
        })
      )
      .subscribe((patientData: Patient) => {
        this.patientDetails = patientData;
        this.maritalStatus = this.patientDetails.maritalStatus;
        this.storageService.setPatientData(patientData);
      });
  }

  // triahe main form group
  initForm(triageValue?: any) {
    this.triageForm = this.formBuilder.group({
      Dockey: triageValue?.Dockey ? triageValue?.Dockey : '',
      Dtid: triageValue?.Dtid ? triageValue?.Dtid : 'ZMED_TRASM',
      Einri: triageValue?.Einri ? triageValue?.Einri : this.storageService.einri,
      Patnr: triageValue?.Patnr ? triageValue?.Patnr : this.storageService.patnr,
      Falnr: triageValue?.Falnr ? triageValue?.Falnr : this.storageService.falnr,
      Lfdnr: triageValue?.Lfdnr ? triageValue?.Lfdnr : this.storageService.lfdnr,
      Orgdo: triageValue?.Orgdo ? triageValue?.Orgdo : 'EMEMDAMC',
      ArrivalMode: triageValue?.ArrivalMode ? triageValue?.ArrivalMode : '',
      ArrivalModeTxt: triageValue?.ArrivalModeTxt ? triageValue?.ArrivalModeTxt : '',
      Accompanied: triageValue?.Accompanied ? triageValue?.Accompanied : '',
      AccompaniedTxt: triageValue?.AccompaniedTxt ? triageValue?.AccompaniedTxt : '',
      Language: triageValue?.Language ? triageValue?.Language : 'English',
      TriagePriority: this.selectedTriageDetails?.TriagePriorityCode || (triageValue?.TriagePriority ?? ''),
      ArrivalTime: triageValue?.ArrivalTime ? this.parseTime(triageValue?.ArrivalTime) : this.getTime(this.selectedTableDetails.ZeitIntern),
      ChiefComplaint: triageValue?.ChiefComplaint ? triageValue?.ChiefComplaint : '',
      PsyNoProblem: triageValue?.PsyNoProblem ? triageValue?.PsyNoProblem : false,
      PsyAnxious: triageValue?.PsyAnxious ? triageValue?.PsyAnxious : false,
      PsyUncooperative: triageValue?.PsyUncooperative ? triageValue?.PsyUncooperative : false,
      PsyDepressed: triageValue?.PsyDepressed ? triageValue?.PsyDepressed : false,
      PsyAngry: triageValue?.PsyAngry ? triageValue?.PsyAngry : false,
      PsyAgitated: triageValue?.PsyAgitated ? triageValue?.PsyAgitated : false,
      PsyCombative: triageValue?.PsyCombative ? triageValue?.PsyCombative : false,
      PsyOther: triageValue?.PsyOther ? triageValue?.PsyOther : false,
      PsyComments: triageValue?.PsyComments ? triageValue?.PsyComments : '',
      AttendPhy: triageValue?.AttendPhy ? triageValue?.AttendPhy : this.storageService.getGpart(),
      DocStatus: '1',
    });
  }

  // for add habit model
  openModelForAddHabitSocial(index: any, item: any) {
    if (item.Status) {
      this.swallConfirmation(item.label, index);
    } else {
      this.socialAddHabit.openModalForAddHabit(item.label, this.selectedTableDetails, this.patientDetails, item);
    }
  }

  swallConfirmation(habitType: string, index, habitNoConsume?: any) {
    Swal.fire({
      text: 'Are you sure you want to edit this Habit?',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      customClass: { popup: 'myalertpopup' },
    }).then((res) => {
      if (res.isConfirmed) {
        if (habitNoConsume == 'noConsume') {
          if (habitType == 'Alcohol') this.saveAlcoholWithNoDrink();
          if (habitType == 'Tobacco') this.saveTabaccolWithNoSmoke();
          if (habitType == 'Drugs') this.saveDrugsWithNoDrugs();
          if (habitType == 'Other') this.saveOtherWithNoOther();
        } else {
          this.socialAddHabit.openModalForAddHabit(
            habitType,
            this.selectedTableDetails,
            this.patientDetails,
            this.socialHistoryList[index]
          );
        }
      }
    });
  }

  // if traige list status is Draft then call this API
  statusDraftDocDetails(documentStatus) {
    this.emergencyService.getTriageDataIfStatusDraft(documentStatus).subscribe((res: any) => {
      this.initForm(res?.d?.results[0]);
      this.toAllergyArr = res?.d?.results[0].TOALLERGIES?.results;
      this.toVitalsArr = res?.d?.results[0].TOVITALSIGNS.results;
      res?.d?.results[0].TOSCALE.results.forEach((element) => {
        this.scalesList.forEach((res: any) => {
          if (element.ScaleType == res.ScaleType && element.LastScore) {
            res.Datetimee = element.Datetimee,
              res.Dockey = element.Dockey,
              res.description = element.ScoreDesc,
              res.LastScore = element.LastScore,
              res.ScaleType = element.ScaleType
          }
        })
      })
    });
  }

  // social history habit list API for table
  getSocialHistoryHabitList() {
    this.emergencyService
      .getSocialHabitList(this.selectedTableDetails.Patnr)
      .subscribe(
        (res: any) => {
          this.socialHabitList = res?.d?.results;
          let checkAlcoholData = res?.d?.results.find(res => res.Type == 'Alcohol');
          if (checkAlcoholData) {
            this.socialHistoryList[0].DateFrom = checkAlcoholData.DateFrom;
            this.socialHistoryList[0].Status = checkAlcoholData.Status;
            this.socialHistoryList[0].Quantity = checkAlcoholData.Quantity;
            this.socialHistoryList[0].Duration = checkAlcoholData.Duration;
            this.socialHistoryList[0].Habitid = checkAlcoholData.Habitid;
          }
          let checkDrugsData = res?.d?.results.find(res => res.Type.split('/')[0].trim() === 'Drug');
          if (checkDrugsData) {
            this.socialHistoryList[1].DateFrom = checkDrugsData.DateFrom;
            this.socialHistoryList[1].Status = checkDrugsData.Status;
            this.socialHistoryList[1].Quantity = checkDrugsData.Quantity;
            this.socialHistoryList[1].Duration = checkDrugsData.Duration;
            this.socialHistoryList[1].Habitid = checkDrugsData.Habitid;
          }
          let checkTobaccoData = res?.d?.results.find(res => res.Type.split('/')[0].trim() === 'Tobacco');
          if (checkTobaccoData) {
            this.socialHistoryList[2].DateFrom = checkTobaccoData.DateFrom;
            this.socialHistoryList[2].Status = checkTobaccoData.Status;
            this.socialHistoryList[2].Quantity = checkTobaccoData.Quantity;
            this.socialHistoryList[2].Duration = checkTobaccoData.Duration;
            this.socialHistoryList[2].Habitid = checkTobaccoData.Habitid;
          }
          let checkOtherData = res?.d?.results.find(res => res.Type.split('/')[0].trim() === 'Other');
          if (checkOtherData) {
            this.socialHistoryList[3].DateFrom = checkOtherData.DateFrom;
            this.socialHistoryList[3].Status = checkOtherData.Status;
            this.socialHistoryList[3].Quantity = checkOtherData.Quantity;
            this.socialHistoryList[3].Duration = checkOtherData.Duration;
            this.socialHistoryList[3].Habitid = checkOtherData.Habitid;
          }
        },
        (error) => { }
      );
  }

  // Allergies & Vitals tab switch function
  switchTabs(tab) {
    if (tab == 'allergies') {
      this.allergy = true;
      this.diagnosis = false;
      this.vitals = false;
    } else if (tab == 'diagnosis') {
      this.allergy = false;
      this.diagnosis = true;
      this.vitals = false;
    } else if (tab == 'vitals') {
      this.allergy = false;
      this.diagnosis = false;
      this.vitals = true;
    }
  }

  // Social and Psychological tabs switch function
  socialAndPsychologicalTabs(tab: string) {
    if (tab == 'social') {
      this.socialHistory = true;
      this.psychologicalHistory = false;
    } else {
      this.socialHistory = false;
      this.psychologicalHistory = true;
    }
  }

  // Open model for allery
  openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
  }

  // Open model for vital's
  openModalVital() {
    if (this.enableCreateVitals) return;
    const item = {
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
      Patient: this.storageService?.patientData?.name,
      admissionDate: this.storageService.patientData.periodStart,
    };
    this.erVitalsModal.openModalForErVital(item);
  }

  deleteVitalsFromTable(item, index) {
    this.toVitalsArr.splice(index, 1);
  }

  deleteFromTable(item, index) {
    this.toAllergyArr.splice(index, 1);
  }

  handleCheckboxVitals() {
    this.enableCreateVitals = !this.enableCreateVitals;
  }

  importAllergyData(data) {
    data.forEach((el) => {
      this.toAllergyArr = this.toAllergyArr.concat({
        Dockey: '',
        Agroup: el.AllergenGrp,
        Description: el.Allergen,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesAllergy();
    this.toAllergyArr = this.toAllergyArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Description === value.Description)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesAllergy();
    }
  }

  findDuplicatesAllergy() {
    let tempArr = [];
    const lookup = this.toAllergyArr.reduce((a, e) => {
      a[e.Description] = ++a[e.Description] || 0;
      return a;
    }, {});
    tempArr = this.toAllergyArr.filter((e) => lookup[e.Description]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Description === value.Description)
    );
  }

  errorMsgForDuplicatesAllergy() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.Description);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' },
    });
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
      customClass: { popup: 'myalertpopup' },
    });
  }

  importVitalsData(data) {
    data.forEach((el) => {
      this.toVitalsArr = this.toVitalsArr.concat({
        Dockey: '',
        Vdescription: el.Name,
        MeasuredValue: el.ValueFormatted,
        NormalRange: el.NormalRange,
        DateTime: `${new DatePipe('en-US').transform(
          this.getDate(el.Date),
          'dd.MM.yyyy'
        )}/${this.getTime(el.Time)}`,
        Vunit: el.UnitTxt,
      });
    });
  }

  // Open Glosgow Scale Model
  openGlosgowComaModel(item: any) {
    if (this.noScaleAppicable) return;
    this.scalesEditConfirmationMsg(item);
  }

  scalesEditConfirmationMsg(item: { value: string; }) {
    Swal.fire({
      text: 'Are you sure you want to edit scale',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
    }).then((res) => {
      if (res.isConfirmed) {
        if (item.value == '1') {
          this.scalesGlosgow.openModalForGlosgow('');
        } else if (item.value == '2') {
          this.scalesFacePain.openModalForFacePain('');
        } else if (item.value == '3') {
          this.scalesNumericRating.openModalForNumericRating('');
        }
      }
    });
  }

  viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.value == '1') {
      if (item.Dockey) {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '2') {
      if (item.Dockey) {
        this.scalesFacePain.openModalForFacePain(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '3') {
      if (item.Dockey) {
        this.scalesNumericRating.openModalForNumericRating(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    }
  }

  // Set Glasgow Scale Value In Table List
  glasgowValue(event) {
    this.scalesList[0].LastScore = event?.totalScore.toString();
    this.scalesList[0].description = event?.description;
    this.scalesList[0].Dockey = event?.dockey;
    this.scalesList[0].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  // Set Numberic Scale Value In Table List
  numericValue(event) {
    this.scalesList[2].LastScore = event?.totalScore;
    this.scalesList[2].description = event?.description;
    this.scalesList[2].Dockey = event?.dockey;
    this.scalesList[2].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  // Set Face Pain Scale Value In tTable List
  facePainValue(event) {
    this.scalesList[1].LastScore = event?.totalScore;
    this.scalesList[1].description = event?.description;
    this.scalesList[1].Dockey = event?.dockey;
    this.scalesList[1].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }


  noConsumeSocial(index?: number, item?, type?: string) {
    if (item?.Status) {
      this.swallConfirmation(item?.label, index, type);
    } else {
      if (item.label == 'Alcohol') this.saveAlcoholWithNoDrink();
      if (item.label == 'Tobacco') this.saveTabaccolWithNoSmoke();
      if (item.label == 'Drugs') this.saveDrugsWithNoDrugs();
      if (item.label == 'Other') this.saveOtherWithNoOther();
    }
  }

  saveHabitData(event) {
    if (event == 'success') {
      this.getSocialHistoryHabitList();
    }
    if (event?.isNoConsume) {
      if (event.habitType == 'Alcohol') this.saveAlcoholWithNoDrink();
      if (event.habitType == 'Tobacco') this.saveTabaccolWithNoSmoke();
      if (event.habitType == 'Drugs') this.saveDrugsWithNoDrugs();
      if (event.habitType == 'Other') this.saveOtherWithNoOther();
    }
  }

  saveAlcoholWithNoDrink() {
    let payload = {
      d: {
        Habitid: this.socialHistoryList[0].Habitid,
        Einri: this.selectedTableDetails.Einri,
        Patnr: this.selectedTableDetails.Patnr,
        RespEmp: JSON.parse(localStorage.getItem('amc_dev_gpart')),
        DepartOu: this.patientDetails.deptOrgUnit,
        TreatOu: this.patientDetails.deptOrgUnit,
        DrinkNo: true,
        NoConsumptionKnown: '',
      },
    };
    this.emergencyService.saveAlcoholWithDrink(payload).subscribe((res) => {
      this.sharedService.successSwallModel(
        'Alcohol habit with no drink saved successfully.'
      );
      this.getSocialHistoryHabitList();
    });
  }

  isDockeyAvailable(): boolean {
    return this.scalesList.some(scale => scale.Dockey && scale.Dockey.trim() !== '');
  }

  saveTabaccolWithNoSmoke() {
    let payload = {
      d: {
        Habitid: this.socialHistoryList[2].Habitid,
        Einri: this.selectedTableDetails.Einri,
        Patnr: this.selectedTableDetails.Patnr,
        RespEmp: JSON.parse(localStorage.getItem('amc_dev_gpart')),
        DepartOu: this.patientDetails.deptOrgUnit,
        TreatOu: this.patientDetails.deptOrgUnit,
        SmokeNo: true,
        NoConsumptionKnown: '',
      },
    };
    this.emergencyService.saveTabaccoHabit(payload).subscribe((res) => {
      this.sharedService.successSwallModel(
        'Tobacco habit with no smoke saved successfully.'
      );
      this.getSocialHistoryHabitList();
    });
  }

  saveDrugsWithNoDrugs() {
    let payload = {
      d: {
        Habitid: this.socialHistoryList[1].Habitid,
        Einri: this.selectedTableDetails.Einri,
        Patnr: this.selectedTableDetails.Patnr,
        RespEmp: JSON.parse(localStorage.getItem('amc_dev_gpart')),
        DepartOu: this.patientDetails.deptOrgUnit,
        TreatOu: this.patientDetails.deptOrgUnit,
        DrugNo: true,
        NoConsumptionKnown: '',
      },
    };
    this.emergencyService.saveDrugsHabit(payload).subscribe((res) => {
      this.sharedService.successSwallModel(
        'Drugs habit with no drugs saved successfully.'
      );
      this.getSocialHistoryHabitList();
    });
  }

  saveOtherWithNoOther() {
    let payload = {
      d: {
        Habitid: this.socialHistoryList[3].Habitid,
        Einri: this.selectedTableDetails.Einri,
        Patnr: this.selectedTableDetails.Patnr,
        RespEmp: JSON.parse(localStorage.getItem('amc_dev_gpart')),
        DepartOu: this.patientDetails.deptOrgUnit,
        TreatOu: this.patientDetails.deptOrgUnit,
        NotConsumes: 'X',
        NoConsumptionKnown: '',
      },
    };
    this.emergencyService.saveOtherHabit(payload).subscribe((res) => {
      this.sharedService.successSwallModel(
        'Other habit with not consumes saved successfully.'
      );
      this.getSocialHistoryHabitList();
    });
  }

  // Remove habit from social history table
  deleteData(index: number, item: any) {
    if (this.noHabitApplicable) return;
    this.socialHistoryList[index] = {
      value: item.value,
      label: item.label,
      Status: '',
      Quantity: '',
      Duration: '',
      Year: null,
      DateFrom: null,
      Habitid: ''
    };
  }

  // Main triage documnet post API
  saveTraige() {
    let checkScalesList: any[] = this.scalesList.filter((res) => {
      delete res.description;
      delete res.value;
      if (res.LastScore) return res;
    });

    let updatedList = this.socialHistoryList.map(item => {
      const { isNoConsume, isAddHabit, Status, value, label, Quantity, DateFrom, Habitid, ...rest } = item;
      if (item.Status) {
        return { ...rest, Description: Status, ConsumptionQty: Quantity, Dockey: '', Year: null };
      }
    });
    updatedList = updatedList.filter(item => item !== undefined);

    let payload = {
      ...this.triageForm.value,
      TOALLERGIES: this.toAllergyArr,
      TOVITALSIGNS: this.toVitalsArr,
      TOSCALE: checkScalesList,
      TOSOCIAL: updatedList
    };

    if (payload.ArrivalTime != '') {
      let createtime = payload.ArrivalTime.split(':');
      payload.ArrivalTime =
        'PT' + createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    }
    // Subscribe using an object to define handlers
    this.emergencyService.saveNurEmrTriage(payload).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        this.updateTriageStatus();
        this.sharedService.successSwallModel('Triage history saved successfully');
        this.modalRefForAllergy?.hide();
      },
      error: (error: any) => {
        // Handle errors if the request fails
        this.sharedService.waringSwallModel(`POST Error : ${error?.error?.error?.message?.value}`);
      }
    });

  }
  public updateTriageStatus(): void {

    let payload = {
      Dockey: this.triageForm.value.Dockey,
      Dokst: "FR",
      Dokvr: this.Zversion,
      Dtid: "ZMED_TRPRI",
      DtidText: "",
      Einri: this.selectedTableDetails.Einri,
      Etag: "",
      Falnr: this.selectedTableDetails.Falnr,
      Lfdnr: this.selectedTableDetails.Lfdbw,
      Mitarb: "",
      Mitarbname: "",
      Orgdo: "",
      Orgfa: "",
      Orgpf: "",
      Patnr: this.selectedTableDetails.Patnr,
      Referredby: "",
      Released: false,
      TriageColor: this.triageList.filter((item) => item.TriagePriorityCode == this.triageForm.value.TriagePriority)[0].TriageColor,
      TriagePriorityCode: this.triageList.filter((item) => item.TriagePriorityCode == this.triageForm.value.TriagePriority)[0].TriagePriorityCode,
      TriagePriorityText: this.triageList.filter((item) => item.TriagePriorityCode == this.triageForm.value.TriagePriority)[0].label,
      Zimmr: "",
      Mode: true,
    };
    this.emergencyService.saveTriage(payload).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
      },
      error: (error: any) => {
        // Handle errors if the request fails
        this.sharedService.waringSwallModel(`POST Error : ${error?.error?.error?.message?.value}`);
      },
    });
  }

  closeMainModel() {
    Swal.fire({
      text: 'Are you sure you want to close without saving the data?',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
    }).then((res) => {
      if (res.isConfirmed) {
        this.modalRefForAllergy?.hide();
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


  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1] + ':' + str[2];
      return finalstr;
    }
  }

  onCheckboxChange(event: any) {
    const isChecked = event.target.checked;

    // If "No Psychological Applicable" checkbox is unchecked
    if (isChecked) {
      // Reset values of other checkboxes to false
      this.triageForm.patchValue({
        PsyAnxious: false,
        PsyUncooperative: false,
        PsyDepressed: false,
        PsyAngry: false,
        PsyAgitated: false,
        PsyCombative: false,
        PsyOther: false
      });
    }
  }
}
