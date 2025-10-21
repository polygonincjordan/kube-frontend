import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { commonKeyValuePair, commonKeyValuePariExt0, commonKeyValuePariExt1, commonKeyValuePariExt2, commonKeyValuePariExt3 } from '@services/e-kardex/interfaces/documents.interface';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription, catchError, of } from 'rxjs';
import { AddHabitSocialComponent } from 'src/app/nursing-emergency-dashboard/check-in/er-triage/add-habit-social/add-habit-social.component';
import { PhysicianCreateAllergyComponent } from 'src/app/nursing-emergency-dashboard/check-in/er-triage/physician-create-allergy/physician-create-allergy.component';
import { PhysicianErVitalsComponent } from 'src/app/nursing-emergency-dashboard/check-in/er-triage/physician-er-vitals/physician-er-vitals.component';
import { ScalesFacePainComponent } from 'src/app/nursing-emergency-dashboard/check-in/er-triage/scales-face-pain/scales-face-pain.component';
import { ScalesGlosgowComaComponent } from 'src/app/nursing-emergency-dashboard/check-in/er-triage/scales-glosgow-coma/scales-glosgow-coma.component';
import { ScalesNumericRatingComponent } from 'src/app/nursing-emergency-dashboard/check-in/er-triage/scales-numeric-rating/scales-numeric-rating.component';
import Swal from 'sweetalert2';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-emergency-nursing-document',
  templateUrl: './emergency-nursing-document.component.html',
  styleUrls: ['./emergency-nursing-document.component.scss']
})
export class EmergencyNursingDocumentComponent implements OnInit, OnDestroy {


  @ViewChild('allergyModal', { static: true }) allergyModal: TemplateRef<any>;
  @ViewChild('createAllergyId') createAllergyId: PhysicianCreateAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: PhysicianErVitalsComponent;
  public triageForm: FormGroup;
  @ViewChild('scalesGlosgow') scalesGlosgow: ScalesGlosgowComaComponent;
  @ViewChild('scalesFacePain') scalesFacePain: ScalesFacePainComponent;
  @ViewChild('scalesNumericRating') scalesNumericRating: ScalesNumericRatingComponent;
  @ViewChild('socialAddHabit') socialAddHabit: AddHabitSocialComponent;

  public modeArrivalList: commonKeyValuePair[] = [
    { value: '0', label: 'Stretcher' },
    { value: '1', label: 'Ambulatory' },
    { value: '2', label: 'Wheel Chair' },
    { value: '3', label: 'Carried' },
    { value: '4', label: 'Cuddled' },
    { value: '5', label: 'Other' },
  ];

  public socialHistoryList: commonKeyValuePariExt0[] = [
    { Habitid: '', value: '0', label: 'Alcohol', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, },
    { value: '1', label: 'Drugs', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
    { value: '2', label: 'Tobacco', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
    { value: '3', label: 'Other', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
  ];

  public accompaniedList: commonKeyValuePair[] = [
    { value: '0', label: 'Spouse' },
    { value: '1', label: 'Relative' },
    { value: '2', label: 'Parents' },
    { value: '3', label: 'Guardian' },
    { value: '4', label: 'Police Officer' },
    { value: '5', label: 'Civil Defence' },
    { value: '6', label: 'Other' },
  ];

  public triageList: commonKeyValuePariExt1[] = [
    { value: '0', label: 'Level I Resuscritation', TriagePriorityCode: '01', TriageColor: 'blue' },
    { value: '1', label: 'Level II Emergency', TriagePriorityCode: '02', TriageColor: 'red' },
    { value: '2', label: 'Level III Urgency', TriagePriorityCode: '03', TriageColor: 'yellow' },
    { value: '3', label: 'Level IV Less Urgency', TriagePriorityCode: '04', TriageColor: 'green' },
    { value: '4', label: 'Level V Non Urgency', TriagePriorityCode: '05', TriageColor: 'white' }
  ];

  public triagePriorities: commonKeyValuePariExt2[] = [
    { value: '01', label: 'Resuscitation', backgroundColor: 'blue', borderColor: '#cacaca', fontColor: 'white' },
    { value: '02', label: 'Emergency', backgroundColor: 'red', borderColor: '#cacaca', fontColor: 'white' },
    { value: '03', label: 'Urgency', backgroundColor: 'yellow', borderColor: '#cacaca', fontColor: 'black' },
    { value: '04', label: 'Less Urgency', backgroundColor: 'green', borderColor: '#cacaca', fontColor: 'white' },
    { value: '05', label: 'Non Urgency', backgroundColor: 'white', borderColor: '#cacaca', fontColor: 'black' }
  ];

  public scalesList: commonKeyValuePariExt3[] = [
    { ScaleType: 'Glasgow Coma Scale', LastScore: '', description: '', Datetimee: '', value: '1', Dockey: '' },
    { ScaleType: 'Face pain scale', LastScore: '', description: '', Datetimee: '', value: '2', Dockey: '' },
    { ScaleType: 'Numeric rating scale(more than 8 years)', LastScore: '', description: '', Datetimee: '', value: '3', Dockey: '' },
  ];


  public toAllergyArr: any = [];
  public toDiagnosisArr: any = [];
  public toVitalsArr: any = [];

  public selectedTableDetails: any;
  private paramsObject: any;
  public encounterId: any;

  public allergy: boolean = true;
  public diagnosis: boolean = false;
  public vitals: boolean = false;
  public enableCreateVitals: boolean = false;
  public enableCreateDiagnosis: boolean = false;
  public noScaleAppicable: boolean = false;
  public psychologicalHistory: boolean = false;
  public socialHistory: boolean = true;
  public noHabitApplicable: boolean = false;
  public patientDetails: Patient;
  public socialHabitList: any[];
  public maritalStatus: any;
  public documentStatus: string = '';
  public dockeyValue: any = null;
  selectedScales:any[]=[];
  scalesArray: any[]=[];
  toScaleArr: any[];
  modalRefScales: BsModalRef;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(
    public storageService: StorageService,
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private _route: ActivatedRoute,
    private emergencyService: EmergencyService,
    private sharedService: SharedService,
    private dataShareService: DataShareService,
    private ePrescriptionService: EPrescriptionService,
    private modalService: BsModalService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      // this.selectedTableDetails = data;
      if (this.paramsObject.lfdnr) {
        this.encounterId = this.paramsObject.einri + this.paramsObject.falnr + this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
      this.getPatinetDetails(this.encounterId);
      this.getSocialHistoryHabitList();
    });

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          if (data.value.type == WordType.EditEND && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.statusDraftDocDetails(data.value.latestTriageData[0]);
            }
          }
        }
        // if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
        //   if (data.value.type == WordType.CopyBS && data.value.docKey != '') {
        //     this.totalScoreCalc();
        //     this.dockeyValue = data.value.docKey ? data.value.docKey : null;
        //     if (this.dockeyValue) {
        //       this.getBradenScaleDetails(data.value.docKey);
        //     }
        //   }
        // }
      }
    });
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.initForm();
  }

  statusDraftDocDetails(documentStatus) {
    this.emergencyService
      .getTriageDataIfStatusDraft(documentStatus)
      .subscribe((res: any) => {
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

  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }


  public initForm(triageValue?: any) {
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
      TriagePriority: triageValue?.TriagePriority ? triageValue?.TriagePriority : '',
      ArrivalTime: triageValue?.ArrivalTime ? this.parseTime(triageValue?.ArrivalTime) : '',
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

  public parseTime(data: string) {
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

  public getPatinetDetails(encounterId) {
    this.patientService.getDataPatient(encounterId).pipe(catchError(() => {
      return of({} as Patient);
    })).subscribe((patientData: Patient) => {
      this.patientDetails = patientData;
      this.maritalStatus = this.patientDetails.maritalStatus;
      this.storageService.setPatientData(patientData);
    });
  }


  public switchTabs(tab) {
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

  public openModalForAllergy() {
    // this.createAllergyId.openModalForAllergy();
  }

  public openModalVital() {
    if (this.enableCreateVitals) return;
    // this.erVitalsModal.openModalForErVital(item);
  }

  public deleteFromTable(index, i) {
    this.toAllergyArr.splice(index, 1);
    console.log(this.toAllergyArr);
  }

  public openModalForDiagnosis() {
    // this.diagnosisNotesKardex.openModalForDiagnosisKardex();
  }

  public deleteDiagnosisFromTable(index, i) {
    this.toDiagnosisArr.splice(index, 1);
  }

  public handleCheckboxVitals() {
    this.enableCreateVitals = !this.enableCreateVitals;
  }

  public deleteVitalsFromTable(index, i) {
    this.toVitalsArr.splice(index, 1);
  }

  public openGlosgowComaModel(item: any) {
    if (this.noScaleAppicable) return;
    this.scalesEditConfirmationMsg(item);
  }

  private scalesEditConfirmationMsg(item: { value: string; }) {
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
          // this.scalesGlosgow.openModalForGlosgow('');
        } else if (item.value == '2') {
          // this.scalesFacePain.openModalForFacePain('');
        } else if (item.value == '3') {
          // this.scalesNumericRating.openModalForNumericRating('');
        }
      }
    });
  }

  public viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.value == '1') {
      if (item.Dockey) {
        // this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else {
        // this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '2') {
      if (item.Dockey) {
        // this.scalesFacePain.openModalForFacePain(item.Dockey);
      } else {
        // this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '3') {
      if (item.Dockey) {
        // this.scalesNumericRating.openModalForNumericRating(item.Dockey);
      } else {
        // this.sharedService.waringSwallModel('No data found');
      }
    }
  }

  public socialAndPsychologicalTabs(tab: string) {
    if (tab == 'social') {
      this.socialHistory = true;
      this.psychologicalHistory = false;
    } else {
      this.socialHistory = false;
      this.psychologicalHistory = true;
    }
  }

  public openModelForAddHabitSocial(index: any, item: any) {
    if (item.Status) {
      this.swallConfirmation(item.label, index);
    } else {
      this.socialAddHabit.openModalForAddHabit(item.label, this.selectedTableDetails, this.patientDetails, item);
    }
  }

  public swallConfirmation(habitType: string, index, habitNoConsume?: any) {
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

  public saveAlcoholWithNoDrink() {
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
    this.emergencyService.saveAlcoholWithDrink(payload).subscribe(() => {
      this.sharedService.successSwallModel(
        'Alcohol habit with no drink saved successfully.'
      );
      this.getSocialHistoryHabitList();
    });
  }

  public saveTabaccolWithNoSmoke() {
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
    this.emergencyService.saveTabaccoHabit(payload).subscribe(() => {
      this.sharedService.successSwallModel(
        'Tobacco habit with no smoke saved successfully.'
      );
      this.getSocialHistoryHabitList();
    });
  }

  isDockeyAvailable(): boolean {
    return this.scalesList.some(scale => scale.Dockey && scale.Dockey.trim() !== '');
  }

  public saveDrugsWithNoDrugs() {
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
    this.emergencyService.saveDrugsHabit(payload).subscribe(() => {
      this.sharedService.successSwallModel(
        'Drugs habit with no drugs saved successfully.'
      );
      this.getSocialHistoryHabitList();
    });
  }

  public saveOtherWithNoOther() {
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
    this.emergencyService.saveOtherHabit(payload).subscribe(() => {
      this.sharedService.successSwallModel(
        'Other habit with not consumes saved successfully.'
      );
      this.getSocialHistoryHabitList();
    });
  }

  // social history habit list API for table
  public getSocialHistoryHabitList() {
    this.emergencyService.getSocialHabitList(this.paramsObject.patnr).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        this.socialHabitList = data?.d?.results;
        let checkAlcoholData = data?.d?.results.find(res => res.Type == 'Alcohol');
        if (checkAlcoholData) {
          this.socialHistoryList[0].DateFrom = checkAlcoholData.DateFrom;
          this.socialHistoryList[0].Status = checkAlcoholData.Status;
          this.socialHistoryList[0].Quantity = checkAlcoholData.Quantity;
          this.socialHistoryList[0].Duration = checkAlcoholData.Duration;
          this.socialHistoryList[0].Habitid = checkAlcoholData.Habitid;
        }
        let checkDrugsData = data?.d?.results.find(res => res.Type.split('/')[0].trim() === 'Drug');
        if (checkDrugsData) {
          this.socialHistoryList[1].DateFrom = checkDrugsData.DateFrom;
          this.socialHistoryList[1].Status = checkDrugsData.Status;
          this.socialHistoryList[1].Quantity = checkDrugsData.Quantity;
          this.socialHistoryList[1].Duration = checkDrugsData.Duration;
          this.socialHistoryList[1].Habitid = checkDrugsData.Habitid;
        }
        let checkTobaccoData = data?.d?.results.find(res => res.Type.split('/')[0].trim() === 'Tobacco');
        if (checkTobaccoData) {
          this.socialHistoryList[2].DateFrom = checkTobaccoData.DateFrom;
          this.socialHistoryList[2].Status = checkTobaccoData.Status;
          this.socialHistoryList[2].Quantity = checkTobaccoData.Quantity;
          this.socialHistoryList[2].Duration = checkTobaccoData.Duration;
          this.socialHistoryList[2].Habitid = checkTobaccoData.Habitid;
        }
        let checkOtherData = data?.d?.results.find(res => res.Type.split('/')[0].trim() === 'Other');
        if (checkOtherData) {
          this.socialHistoryList[3].DateFrom = checkOtherData.DateFrom;
          this.socialHistoryList[3].Status = checkOtherData.Status;
          this.socialHistoryList[3].Quantity = checkOtherData.Quantity;
          this.socialHistoryList[3].Duration = checkOtherData.Duration;
          this.socialHistoryList[3].Habitid = checkOtherData.Habitid;
        }
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error fetching Data:', err);
      },
    });
  }

  public noConsumeSocial(index?: number, item?, type?: string) {
    if (item?.Status) {
      this.swallConfirmation(item?.label, index, type);
    } else {
      if (item.label == 'Alcohol') this.saveAlcoholWithNoDrink();
      if (item.label == 'Tobacco') this.saveTabaccolWithNoSmoke();
      if (item.label == 'Drugs') this.saveDrugsWithNoDrugs();
      if (item.label == 'Other') this.saveOtherWithNoOther();
    }
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

  openModalForScales(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class:
        'modal-dialog modal-dialog-centered medication-order-case modal-xl',
    };
    this.modalRefScales = this.modalService.show(template, config);
    this.loadScalesData();
    // this.medicationImportDrugArray=[];
  }

  loadScalesData() {
    // this.selectedScales = [];
    this.toScaleArr = [];
    const scalesOrders: Subscription = this.ePrescriptionService.loadData(`e-prescription/ScalesList?Patnr=${this.ePrescriptionService.parameters.patnr}`, false, false, false, false).subscribe((resp: any) => {
     console.log(resp)
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        //this.configurationData = resp.body.d.results;
        // this.toScaleArr = resp.body.d.results;
        if(resp.body?.d?.results.length) {
          let requiredScales = ["Glasgow Coma Scale", "Morse Fall Scale (MFS)", "Braden scale for predicting pressure ulcers"];
          this.toScaleArr = resp.body.d.results.filter(scale => requiredScales.includes(scale.Scaletype)).map(scale => ({ ...scale, isSelected: false }));
        }
        // this.medicationImportDrugArray=[];
       //http://http://192.168.193.9:6051:8000/sap/opu/odata/sap/ZN_TRANSFER_ASSES_SRV/PatScalesSet?$filter=Patnr
      }
      //   this.filterEvents();
    }, () => { scalesOrders.unsubscribe(); });
  }

  scalesImport() {

    this.selectedScales.forEach((element) => {
      this.scalesList.forEach((res: any) => {
        if (element.Scaletype == res.ScaleType && element.Score) {
          res.Datetimee = element.DateTime,
            res.Dockey = element.Dockey,
            res.ScoreDesc = element.ScoreDesc,
            res.LastScore = element.Score,
            res.ScaleType = element.Scaletype
        }
      })
    })
    // this.selectedScales.forEach(element => {
    //   console.log(element)
    //   this.scalesArray = this.scalesArray.concat({
    //     "Dockey": "",
    //     "ScaleType": element.Scaletype ,
    //     "ScoreDesc": element.ScoreDesc ,
    //     "Datetimee": element.DateTime,
    //     "LastScore": element.Score,
    //   });
    // });
    this.modalRefScales.hide();
  }

  collectAllScalesData(event: any) {
    if (event.target.checked) {
      this.selectedScales = (Object.assign([], this.toScaleArr));
    } else {
      this.selectedScales = [];
    }
  }

  isCheckedScale(item: any): boolean {
    return this.selectedScales.some(x => x.Scaletype == item.Scaletype);
  }

  collectScalesIData(event, item, i) {
    if (event.target.checked) {
      this.toScaleArr[i].isSelected = true;
      this.selectedScales.push(item);
    } else {
      this.toScaleArr[i].isSelected = false;
      const indexOf = this.selectedScales.findIndex(x => x.Scaletype == item.Scaletype);
      if (indexOf !== -1)
        this.selectedScales.splice(indexOf, 1);
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
}
