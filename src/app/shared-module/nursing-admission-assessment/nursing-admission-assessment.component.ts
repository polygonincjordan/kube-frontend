import { Component, OnInit, ViewChild } from '@angular/core';
import { PhysicianAllergyComponent } from './physician-allergy/physician-allergy.component';
import Swal from 'sweetalert2';
import {
  commonKeyValuePariExt0,
  commonKeyValuePariExt3,
  commonKeyValuePariExt4,
} from '@services/e-kardex/interfaces/documents.interface';
import { DatePipe } from '@angular/common';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { FacePainScalePopupComponent } from './face-pain-scale/face-pain-scale-popup.component';
import { NumericRatingScalePopupComponent } from './numeric-rating-scale/numeric-rating-scale-popup.component';
import { SharedService } from '@services/shared.service';
import { SocialHabitComponent } from './social-habit/social-habit.component';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '@services/e-kardex/patient.service';
import { StorageService } from '@services/storage.service';
import { VaccinationExposureSectionComponent } from './vaccination-exposure-section/vaccination-exposure-section.component';
import { CommanService } from '@services/comman.service';
import { Subscription, catchError, of } from 'rxjs';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';

@Component({
  selector: 'app-nursing-admission-assessment',
  templateUrl: './nursing-admission-assessment.component.html',
  styleUrls: ['./nursing-admission-assessment.component.scss'],
})
export class NursingAdmissionAssessmentComponent implements OnInit {
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;
  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScalePopupComponent;
  @ViewChild('scalesFacePain') scalesFacePain: FacePainScalePopupComponent;
  @ViewChild('scalesNumericRating')
  scalesNumericRating: NumericRatingScalePopupComponent;
  @ViewChild('socialAddHabit') socialAddHabit: SocialHabitComponent;
  @ViewChild(VaccinationExposureSectionComponent)
  vaccinationComp: VaccinationExposureSectionComponent;

  public nursingAdmissionForm: FormGroup;
  public TOMEDICATION: FormArray;
  public TOINFECTION: FormArray;

  toAllergyArr: any = [];
  duplicates: any[];
  public socialHabitList: any[];

  public psychologicalHistory: boolean = false;
  public occupationalHistory: boolean = false;
  public economicHistory: boolean = false;
  public socialHistory: boolean = true;
  public noHabitApplicable: boolean = false;

  public selectedTableDetails: any;
  public maritalStatus: any;
  public patientDetails: Patient;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  public scalesList: commonKeyValuePariExt3[] = [
    {
      ScaleType: 'Glasgow Coma Scale',
      LastScore: '',
      description: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: 'Face pain scale',
      LastScore: '',
      description: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    },
    {
      ScaleType: 'Numeric rating scale(more than 8 years)',
      LastScore: '',
      description: '',
      Datetimee: '',
      value: '3',
      Dockey: '',
    },
  ];

  public psychologicalHistoryList: commonKeyValuePariExt4[] = [
    { value: '01', label: 'Anxious', controlname: 'PsyAnxious' },
    { value: '02', label: 'Uncooperative', controlname: 'PsyUncooperative' },
    { value: '03', label: 'Depressed', controlname: 'PsyDepressed' },
    { value: '04', label: 'Angry', controlname: 'PsyAngry' },
    { value: '05', label: 'Agitated', controlname: 'PsyAgitated' },
    { value: '06', label: 'Combative', controlname: 'PsyCombative' },
    { value: '07', label: 'Other', controlname: 'PsyOther' },
  ];

  public currentOccupationList = [
    {
      label: 'Full Time Employment',
      value: '1',
    },
    {
      label: 'Part Time Employment',
      value: '2',
    },
    {
      label: 'Self-employed',
      value: '3',
    },
    {
      label: 'Multiple Jobs',
      value: '4',
    },
    {
      label: 'Unemployed',
      value: '5',
    },
    {
      label: 'Student',
      value: '6',
    },
    {
      label: 'Retied',
      value: '7',
    },
  ];

  occupationalOtherList = [
    {
      label: 'Yes',
      value: '0',
    },
    {
      label: 'No',
      value: '1',
    },
  ];

  relationashipList = [
    {
      label: 'Parents',
      value: '0',
    },
    {
      label: 'Father',
      value: '1',
    },
    {
      label: 'Mother',
      value: '2',
    },
    {
      label: 'Grandparents',
      value: '3',
    },
    {
      label: 'Uncle/Aunt',
      value: '4',
    },
    {
      label: 'Cousin',
      value: '5',
    },
    {
      label: 'Brother/Sister',
      value: '6',
    },
    {
      label: 'Other',
      value: '7',
    },
  ];

  public socialHistoryList: commonKeyValuePariExt0[] = [
    {
      Habitid: '',
      value: '0',
      label: 'Alcohol',
      Status: '',
      Quantity: '',
      Duration: '',
      Year: '',
      DateFrom: null,
    },
    {
      value: '1',
      label: 'Drugs',
      Status: '',
      Quantity: '',
      Duration: '',
      Year: '',
      DateFrom: null,
      Habitid: '',
    },
    {
      value: '2',
      label: 'Tobacco',
      Status: '',
      Quantity: '',
      Duration: '',
      Year: '',
      DateFrom: null,
      Habitid: '',
    },
    {
      value: '3',
      label: 'Other',
      Status: '',
      Quantity: '',
      Duration: '',
      Year: '',
      DateFrom: null,
      Habitid: '',
    },
  ];
  noScaleAppicable: any;
  paramsObject: any;
  encounterId: any;
  constructor(
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private emergencyService: EmergencyService,
    private datePipe: DatePipe,
    private _route: ActivatedRoute,
    private patientService: PatientService,
    private storageService: StorageService,
    private commanService: CommanService,
    private dataShareService: DataShareService,
    private dayCaseDashboard: DayCaseDashboardService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.encounterId =
        this.paramsObject.einri +
        this.paramsObject.falnr +
        this.paramsObject.lfdnr;
      this.getPatinetDetails(this.encounterId);
    });
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
        this.patientDetails = patientData;
        this.maritalStatus = this.patientDetails.maritalStatus;
        this.storageService.setPatientData(patientData);
      });
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss a');
    console.log(currentTime);
    

    this.nursingAdmissionForm = this.formBuilder.group({
      Dockey: '',
      Dtid: 'ZMED_NRADM',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService.patientData.deptOrgUnit,
      AAdmittedWard: '2nd Floor-Zone C-IP',
      ADate: [new Date()],
      ATime: "",
      ARoom: '',
      AReferralType: '',
      AAdmissionMode: '',
      AAdmissionModeT: '',
      AAccompaniedBy: '',
      AAccompaniedByT: '',
      AInfoObtained: '',
      AInfoObtainedT: '',
      ALanguageSpoken: 'English',
      ASchoolGrade: '',
      AEducated: '',
      AFavouriteToy: '',
      AReasonVisit: '',
      AChiefComplaint: '',
      Substances: '',
      Vaccinated: '',
      InfectionStatus: '',
      PsyNoProblem: false,
      PsyAnxious: false,
      PsyUncooperative: false,
      PsyDepressed: false,
      PsyAngry: false,
      PsyAgitated: false,
      PsyCombative: false,
      PsyOther: false,
      PsyComments: '',
      OccOccupationalStatus: '',
      OccOccupationalStatusTxt: '',
      OccJobNature: '',
      OccHealthProblems: '',
      OccHealthProblemsTxt: '',
      OccHealthInjury: '',
      OccHealthInjuryTxt: '',
      OccJob: '',
      OccJobTxt: '',
      OccDailyNeeds: '',
      OccDailyNeedsTxt: '',
      OccSpouseWork: '',
      OccSpouseWorkTxt: '',
      OccComments: '',
      EcoLiving: '',
      EcoNoPeople: '',
      EcoRelationship: '',
      EcoRelationshipTxt: '',
      EcoPhone: '',
      EcoFatherJob: '',
      EcoInsurance: '',
      GgRectalPain: false,
      GgIndigestion: false,
      GbAbsent: false,
      GbPresent: false,
      GbHypoactive: false,
      GbHyperactive: false,
      GaSoft: false,
      GaDistendend: false,
      GaFirm: false,
      GaTenderness: false,
      GeEnema: false,
      GeLaxatives: false,
      GeOstomyType: false,
      GeOstomyTypeTxt: '',
      GeOther: false,
      GeOtherTxt: '',
      RmProstate: false,
      RmLesions: false,
      RmDischarge: false,
      RmScrotal: false,
      RmDescr: '',
      RfPregnant: false,
      RfLmp: null,
      RfDischarge: false,
      RfLesions: false,
      RfItching: false,
      RfPelvic: false,
      RfMenarcheAge: '',
      RfNotReached1: false,
      RfMenopauseAge: '',
      RfNotReached2: false,
      RfBirthCont: false,
      RfBirthContTxt: '',
      RbTenderness: false,
      RbDischarge: false,
      RbSwelling: false,
      RbProsthesis: false,
      RbLumps: false,
      GPainful: false,
      GIncontinence: false,
      GBurning: false,
      GHematuria: false,
      GOliguria: false,
      GDysuria: false, //
      GPolyuria: false,
      GDribbling: false,
      GNocturia: false,
      GRetention: false,
      GStraining: false,
      GUrineColour: '',
      GUrineClarity: '',
      GCatheterType: false,
      GCatheterTypeTxt: '',
      GMicturition: '',
      GOther: false,
      GOtherTxt: '',
      SSkinColor: '',
      SSkinColorTxt: '',
      STemperature: '',
      SMoisture: '',
      SLesions: '',
      SLocation: '',
      NnHeadache: false,
      NnDizziness: false,
      NnNumbness: false,
      NnNumbnessLoc: '',
      NnTingling: false,
      NnTinglingLoc: '',
      NnParalysis: false,
      NnParalysisLoc: '',
      NnTremors: false,
      NnTremorsLoc: '',
      NLevelConscious: '',
      NoPlace: false,
      NoTime: false,
      NoPresent: false,
      NResponsiveness: '',
      CgChestPain: false,
      CgPalpitations: false,
      CgPacemaker: false,
      CgPainCalves: false,
      CpRegular: false,
      CpIrregular: false,
      CpStrong: false,
      CpWeak: false,
      CPedalPulses: '',
      CeYes: false,
      CeNo: false,
      CePitting: false,
      CeNonPitting: false,
      CeLocation: '',
      CNailBed: '',
      CCapillaryRefill: '',
      EeHardHearing: '',
      EePain: '',
      EeDrainage: '',
      EeDeaf: '',
      EnEpistaxis: false,
      EnCongestion: false,
      EnDrainage: false,
      EnType: '',
      EtDysphagia: false,
      EtBleeding: false,
      EtSwollenGlands: false,
      EtSwollenGums: false,
      EtPain: false,
      EtLesions: false,
      EtLocation: '',
      OGlassEye: '',
      ORedness: '',
      OPain: '',
      ODischarge: '',
      OBlind: '',
      OComments: '',
      RChestAppearance: '',
      RbDyspneaRest: false,
      RbDyspneaExertion: false,
      RbNonLabored: false,
      RBbreathSounds: '',
      RRhonchi: '',
      RCough: '',
      RColor: '',
      RAmount: '',
      RTracheostomy: false,
      RTubeSize: '',
      RO2: false,
      RBy: '',
      ROtherTxt: '', //
      RAt: "",
      FunSelfNoProblem: false,
      FunSelfNeedsSuper: false,
      FunSelfNeedsFeeding: false,
      FunSelfNeedsHygiene: false,
      FunSelfNeedsToileting: false,
      FunSelfNeedsAmulation: false,
      FunMusNoProblem: false,
      FunMusProblemIdentified: false,
      FunMusProblems: '',
      FunAssEquipmentNone: false,
      FunAssEquipmentUseOf: false,
      FunAssEquipmentUseOfTyp: '',
      FunAssEquipmentUseOfTxt: '',
      FunDrNotification: '',
      FunNotified: '',
      ImpairedNutritional0: false,
      ImpairedNutritional1: false,
      ImpairedNutritional2: false,
      ImpairedNutritional3: false,
      ImpairedNutritionalScore: '',
      SeverityDisease0: false,
      SeverityDisease1: false,
      SeverityDisease2: false,
      SeverityDisease3: false,
      SeverityDiseaseScore: '',
      TotalScore: '',
      AgeAdjustedScore: '',
      PhysicianInformed: '',
      NamePhysician: '',
      PComments: '',
      SSleepRest: '',
      SSleepTime: '',
      SNumberHours: '',
      SComments: '',
      OIdBand: false,
      OBathroom: false,
      OBatchCallLight: false,
      ONurseCall: false,
      OMealTimes: false,
      OVisitingHours: false,
      OTvControl: false,
      ONonSmokingPolicy: false,
      OEqual: false,
      OTelephone: false,
      OFallRiskScore: false,
      MaritalStatus: '',
      Since: '',
      NumberSpouse: '',
      HComments: '',
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: '1',
      TOMEDICATION: new FormArray([]),
      TOINFECTION: new FormArray([]),
      disabledAllPhy: false
    });

    const currentTime1 = new Date();
    const hours = currentTime1.getHours().toString().padStart(2, '0');
    const minutes = currentTime1.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime1.getSeconds().toString().padStart(2, '0');
    this.nursingAdmissionForm.get('ATime')?.setValue(`${hours}:${minutes}:${seconds}`);
    this.nursingAdmissionForm.get('RAt')?.setValue(`${hours}:${minutes}:${seconds}`);
    this.defaultAddRow();
    this.defaultAddRowInfectious();
  }

  // Vaccination FormArray Details
  addItemRow() {
    this.TOMEDICATION = this.nursingAdmissionForm.get('TOMEDICATION') as FormArray;
    this.TOMEDICATION.push(this.itemFormArrayFieldForMedication());
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

  itemFormArrayFieldForMedication(): FormGroup {
    return this.formBuilder.group({
      Dockey: [''],
      vaccination: [''],
      othervaccination: [''],
      status: [''],
      date: [false],
    });
  }

  defaultAddRow() {
    for (let index = 0; index < 3; index++) {
      this.addItemRow();
    }
  }

  // Infectious FormArray Details
  addItemRowInfectious() {
    this.TOINFECTION = this.nursingAdmissionForm.get('TOINFECTION') as FormArray;
    this.TOINFECTION.push(this.itemFormArrayFieldForInfectious());
  }

  itemFormArrayFieldForInfectious(): FormGroup {
    return this.formBuilder.group({
      Dockey: [''],
      InfectiousDiesease: [''],
      Status: [''],
      TypeIsolation: [''],
    });
  }

  defaultAddRowInfectious() {
    for (let index = 0; index < 3; index++) {
      this.addItemRowInfectious();
    }
  }

  addTableRow(event: any) {
   if(event == 'Vaccination History') {
    this.addItemRow();
   } else {
    this.addItemRowInfectious()
   }
  }

  public deleteFromAllergy(item, index) {
    this.toAllergyArr.splice(index, 1);
  }

  public openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
  }
  public onCheckboxChange(event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.nursingAdmissionForm.patchValue({
        PsyAnxious: false,
        PsyUncooperative: false,
        PsyDepressed: false,
        PsyAngry: false,
        PsyAgitated: false,
        PsyCombative: false,
        PsyOther: false,
      });
    }
  }

  public importAllergyData(data) {
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

  private findDuplicatesAllergy() {
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

  private errorMsgForDuplicatesAllergy() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.Description);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup',
    });
  }

  public glasgowValue(event) {
    this.scalesList[0].LastScore = event?.totalScore.toString();
    this.scalesList[0].description = event?.description;
    this.scalesList[0].Dockey = event?.dockey;
    this.scalesList[0].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  public facePainValue(event) {
    this.scalesList[1].LastScore = event?.totalScore;
    this.scalesList[1].description = event?.description;
    this.scalesList[1].Dockey = event?.dockey;
    this.scalesList[1].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  public numericValue(event) {
    this.scalesList[2].LastScore = event?.totalScore;
    this.scalesList[2].description = event?.description;
    this.scalesList[2].Dockey = event?.dockey;
    this.scalesList[2].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  public openGlosgowComaModel(item: any) {
    if (this.noScaleAppicable) return;
    if (item.Dockey) {
      this.scalesEditConfirmationMsg(item);
    } else {
      this.openModalScale(item);
    }
  }

  private scalesEditConfirmationMsg(item: { value: string }) {
    Swal.fire({
      text: 'Are you sure you want to edit scale',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
    }).then((res) => {
      if (res.isConfirmed) {
        this.openModalScale(item);
      }
    });
  }

  openModalScale(item) {
    if (item.value == '1') {
      this.scalesGlosgow.openModalForGlosgow('');
    } else if (item.value == '2') {
      this.scalesFacePain.openModalForFacePain('');
    } else if (item.value == '3') {
      this.scalesNumericRating.openModalForNumericRating('');
    }
  }

  public viewGlosgowModel(item) {
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

  public socialAndPsychologicalTabs(tab: string) {
    this.socialHistory = false;
    this.psychologicalHistory = false;
    this.occupationalHistory = false;
    this.economicHistory = false;
    if (tab == 'social') {
      this.socialHistory = true;
    } else if (tab == 'psychological') {
      this.psychologicalHistory = true;
    } else if (tab == 'occupational') {
      this.occupationalHistory = true;
    } else {
      this.economicHistory = true;
    }
  }

  public openModelForAddHabitSocial(index: any, item: any) {
    if (item.Status) {
      this.swallConfirmation(item.label, index);
    } else {
      this.socialAddHabit.openModalForAddHabit(
        item.label,
        this.paramsObject,
        this.patientDetails,
        item
      );
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

  public swallConfirmation(habitType: string, index, habitNoConsume?: any) {
    Swal.fire({
      text: 'Are you sure you want to edit this Habit?',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      customClass: 'myalertpopup',
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
            this.paramsObject,
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
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
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
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
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

  public saveDrugsWithNoDrugs() {
    let payload = {
      d: {
        Habitid: this.socialHistoryList[1].Habitid,
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
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
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
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
    this.emergencyService
      .getSocialHabitList(this.paramsObject.patnr)
      .subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          this.socialHabitList = data?.d?.results;
          let checkAlcoholData = data?.d?.results.find(
            (res) => res.Type == 'Alcohol'
          );
          if (checkAlcoholData) {
            this.socialHistoryList[0].DateFrom = checkAlcoholData.DateFrom;
            this.socialHistoryList[0].Status = checkAlcoholData.Status;
            this.socialHistoryList[0].Quantity = checkAlcoholData.Quantity;
            this.socialHistoryList[0].Duration = checkAlcoholData.Duration;
            this.socialHistoryList[0].Habitid = checkAlcoholData.Habitid;
          }
          let checkDrugsData = data?.d?.results.find(
            (res) => res.Type.split('/')[0].trim() === 'Drug'
          );
          if (checkDrugsData) {
            this.socialHistoryList[1].DateFrom = checkDrugsData.DateFrom;
            this.socialHistoryList[1].Status = checkDrugsData.Status;
            this.socialHistoryList[1].Quantity = checkDrugsData.Quantity;
            this.socialHistoryList[1].Duration = checkDrugsData.Duration;
            this.socialHistoryList[1].Habitid = checkDrugsData.Habitid;
          }
          let checkTobaccoData = data?.d?.results.find(
            (res) => res.Type.split('/')[0].trim() === 'Tobacco'
          );
          if (checkTobaccoData) {
            this.socialHistoryList[2].DateFrom = checkTobaccoData.DateFrom;
            this.socialHistoryList[2].Status = checkTobaccoData.Status;
            this.socialHistoryList[2].Quantity = checkTobaccoData.Quantity;
            this.socialHistoryList[2].Duration = checkTobaccoData.Duration;
            this.socialHistoryList[2].Habitid = checkTobaccoData.Habitid;
          }
          let checkOtherData = data?.d?.results.find(
            (res) => res.Type.split('/')[0].trim() === 'Other'
          );
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

  createNursingAdmissionDoc(dockey: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      let paylaod = this.nursingAdmissionForm.value;
      paylaod.ADate = this.sanitizeSAPDateFormat(this.nursingAdmissionForm.value.ADate);
      paylaod.ATime = this.parsePayloadFormateTime(this.nursingAdmissionForm.value.ATime);
      paylaod.RAt = this.parsePayloadFormateTime(this.nursingAdmissionForm.value.RAt);
      delete paylaod.disabledAllPhy
      delete paylaod.TOMEDICATION
      paylaod.TOALLERGIES = this.toAllergyArr;
      paylaod.TOSCALE = this.scalesList.filter(item => item.LastScore);
      paylaod.TOINFECTION = this.nursingAdmissionForm.value.TOINFECTION.filter(item => item.InfectiousDiesease);
      paylaod.TOSCALE.forEach((element: any) =>{
        if(element.LastScore){ 
          element.Datetimee = this.formatDateToMilliseconds(element.Datetimee)
        }
      });
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

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  formatDateToMilliseconds(dateString: string): string {
    const [datePart, timePart] = dateString.split('/');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    const timeInMillis = date.getTime();
    return `/Date${timeInMillis}/`;
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
  public deleteData(index: number, item: any) {
    if (this.noHabitApplicable) return;
    this.socialHistoryList[index] = {
      value: item.value,
      label: item.label,
      Status: '',
      Quantity: '',
      Duration: '',
      Year: null,
      DateFrom: null,
      Habitid: '',
    };
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
    if (
      !data ||
      data.length !== 11 ||
      data[4] !== 'H' ||
      data[7] !== 'M' ||
      data[10] !== 'S'
    ) {
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
