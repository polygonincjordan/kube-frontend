import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '@services/e-kardex/patient.service';
import { StorageService } from '@services/storage.service';
import { VaccinationExposureSectionComponent } from './vaccination-exposure-section/vaccination-exposure-section.component';
import { CommanService } from '@services/comman.service';
import { Subscription, catchError, of } from 'rxjs';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { ActionType } from '@services/interfaces/common.enum';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

@Component({
  selector: 'app-nursing-admission-assessment',
  templateUrl: './nursing-admission-assessment.component.html',
  styleUrls: ['./nursing-admission-assessment.component.scss'],
})
export class NursingAdmissionAssessmentComponent implements OnInit {
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;
  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScalePopupComponent;
  @ViewChild('morseFallScale') morseFallScale: MorseFallScaleComponent;
  @ViewChild('bradenScaleTemp') bradenScaleTemp: BradenScaleComponent;
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
  selectedScales:any[]=[];
  scalesArray: any[]=[];
  toScaleArr: any[];
  modalRefScales: BsModalRef;

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

  public scalesList: any[] = [
    {
      ScaleType: 'Glasgow Coma Scale',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: 'Morse Fall Scale (MFS)',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    },
    {
      ScaleType: 'Braden scale for predicting pressure ulcers',
      LastScore: '',
      ScoreDesc: '',
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
  docKey: any;
  isFormValidError: boolean = false;

  constructor(
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private emergencyService: EmergencyService,
    private datePipe: DatePipe,
    private _route: ActivatedRoute,
    private patientService: PatientService,
    public storageService: StorageService,
    private commanService: CommanService,
    private dataShareService: DataShareService,
    private dayCaseDashboard: DayCaseDashboardService,
    private modalService: BsModalService,
    private ePrescriptionService: EPrescriptionService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.encounterId =
        this.paramsObject.einri +
        this.paramsObject.falnr +
        this.paramsObject.lfdnr;
      this.getPatinetDetails(this.encounterId);
    });
    this.initForm();

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

  getNursingAdmissionDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .getNursingAdmissionDocData(docKey)
      .subscribe({
        next: (data: any) => {
          this.nursingAdmissionForm.patchValue({
            Dockey: data.d.results[0]?.Dockey,
            Dtid: data.d.results[0]?.Dtid,
            Einri: data.d.results[0]?.Einri,
            Patnr: data.d.results[0]?.Patnr,
            Falnr: data.d.results[0]?.Falnr,
            Lfdnr: data.d.results[0]?.Lfdnr,
            Orgdo: data.d.results[0]?.Orgdo,
            AAdmittedWard: data.d.results[0]?.AAdmittedWard,
            ADate: [data.d.results[0]?.ADate],
            ATime: data.d.results[0]?.ATime,
            ARoom: data.d.results[0]?.ARoom,
            AReferralType: data.d.results[0]?.AReferralType,
            AAdmissionMode: data.d.results[0]?.AAdmissionMode,
            AAdmissionModeT: data.d.results[0]?.AAdmissionModeT,
            AAccompaniedBy: data.d.results[0]?.AAccompaniedBy,
            AAccompaniedByT: data.d.results[0]?.AAccompaniedByT,
            AInfoObtained: data.d.results[0]?.AInfoObtained,
            AInfoObtainedT: data.d.results[0]?.AInfoObtainedT,
            ALanguageSpoken: data.d.results[0]?.ALanguageSpoken,
            // ASchoolGrade: data.d.results[0]?.ASchoolGrade,
            AEducated: data.d.results[0]?.AEducated,
            AFavouriteToy: data.d.results[0]?.AFavouriteToy,
            AReasonVisit: data.d.results[0]?.AReasonVisit,
            AChiefComplaint: data.d.results[0]?.AChiefComplaint,
            Substances: data.d.results[0]?.Substances,
            Vaccinated: data.d.results[0]?.Vaccinated,
            InfectionStatus: data.d.results[0]?.InfectionStatus,
            PsyNoProblem: data.d.results[0]?.PsyNoProblem,
            PsyAnxious: data.d.results[0]?.PsyAnxious,
            PsyUncooperative: data.d.results[0]?.PsyUncooperative,
            PsyDepressed: data.d.results[0]?.PsyDepressed,
            PsyAngry: data.d.results[0]?.PsyAngry,
            PsyAgitated: data.d.results[0]?.PsyAgitated,
            PsyCombative: data.d.results[0]?.PsyCombative,
            PsyOther: data.d.results[0]?.PsyOther,
            PsyComments: data.d.results[0]?.PsyComments,
            OccOccupationalStatus: data.d.results[0]?.OccOccupationalStatus,
            OccOccupationalStatusTxt: data.d.results[0]?.OccOccupationalStatusTxt,
            OccJobNature: data.d.results[0]?.OccJobNature,
            OccHealthProblems: data.d.results[0]?.OccHealthProblems,
            OccHealthProblemsTxt: data.d.results[0]?.OccHealthProblemsTxt,
            OccHealthInjury: data.d.results[0]?.OccHealthInjury,
            OccHealthInjuryTxt: data.d.results[0]?.OccHealthInjuryTxt,
            OccJob: data.d.results[0]?.OccJob,
            OccJobTxt: data.d.results[0]?.OccJobTxt,
            OccDailyNeeds: data.d.results[0]?.OccDailyNeeds,
            OccDailyNeedsTxt: data.d.results[0]?.OccDailyNeedsTxt,
            OccSpouseWork: data.d.results[0]?.OccSpouseWork,
            OccSpouseWorkTxt: data.d.results[0]?.OccSpouseWorkTxt,
            OccComments: data.d.results[0]?.OccComments,
            EcoLiving: data.d.results[0]?.EcoLiving,
            EcoNoPeople: data.d.results[0]?.EcoNoPeople,
            EcoRelationship: data.d.results[0]?.EcoRelationship,
            EcoRelationshipTxt: data.d.results[0]?.EcoRelationshipTxt,
            EcoPhone: data.d.results[0]?.EcoPhone,
            EcoFatherJob: data.d.results[0]?.EcoFatherJob,
            EcoInsurance: data.d.results[0]?.EcoInsurance,
            GgRectalPain: data.d.results[0]?.GgRectalPain,
            GgIndigestion: data.d.results[0]?.GgIndigestion,
            GbAbsent: data.d.results[0]?.GbAbsent,
            GbPresent: data.d.results[0]?.GbPresent,
            GbHypoactive: data.d.results[0]?.GbHypoactive,
            GbHyperactive: data.d.results[0]?.GbHyperactive,
            GaSoft: data.d.results[0]?.GaSoft,
            GaDistendend: data.d.results[0]?.GaDistendend,
            GaFirm: data.d.results[0]?.GaFirm,
            GaTenderness: data.d.results[0]?.GaTenderness,
            GeEnema: data.d.results[0]?.GeEnema,
            GeLaxatives: data.d.results[0]?.GeLaxatives,
            GeOstomyType: data.d.results[0]?.GeOstomyType,
            GeOstomyTypeTxt: data.d.results[0]?.GeOstomyTypeTxt,
            GeOther: data.d.results[0]?.GeOther,
            GeOtherTxt: data.d.results[0]?.GeOtherTxt,
            RmProstate: data.d.results[0]?.RmProstate,
            RmLesions: data.d.results[0]?.RmLesions,
            RmDischarge: data.d.results[0]?.RmDischarge,
            RmScrotal: data.d.results[0]?.RmScrotal,
            RmDescr: data.d.results[0]?.RmDescr,
            RfPregnant: data.d.results[0]?.RfPregnant,
            RfLmp: data.d.results[0]?.RfLmp,
            RfDischarge: data.d.results[0]?.RfDischarge,
            RfLesions: data.d.results[0]?.RfLesions,
            RfItching: data.d.results[0]?.RfItching,
            RfPelvic: data.d.results[0]?.RfPelvic,
            RfMenarcheAge: data.d.results[0]?.RfMenarcheAge,
            RfNotReached1: data.d.results[0]?.RfNotReached1,
            RfMenopauseAge: data.d.results[0]?.RfMenopauseAge,
            RfNotReached2: data.d.results[0]?.RfNotReached2,
            RfBirthCont: data.d.results[0]?.RfBirthCont,
            RfBirthContTxt: data.d.results[0]?.RfBirthContTxt,
            RbTenderness: data.d.results[0]?.RbTenderness,
            RbDischarge: data.d.results[0]?.RbDischarge,
            RbSwelling: data.d.results[0]?.RbSwelling,
            RbProsthesis: data.d.results[0]?.RbProsthesis,
            RbLumps: data.d.results[0]?.RbLumps,
            GPainful: data.d.results[0]?.GPainful,
            GIncontinence: data.d.results[0]?.GIncontinence,
            GBurning: data.d.results[0]?.GBurning,
            GHematuria: data.d.results[0]?.GHematuria,
            GOliguria: data.d.results[0]?.GOliguria,
            GDysuria: data.d.results[0]?.GDysuria, //
            GPolyuria: data.d.results[0]?.GPolyuria,
            GDribbling: data.d.results[0]?.GDribbling,
            GNocturia: data.d.results[0]?.GNocturia,
            GRetention: data.d.results[0]?.GRetention,
            GStraining: data.d.results[0]?.GStraining,
            GUrineColour: data.d.results[0]?.GUrineColour,
            GUrineClarity: data.d.results[0]?.GUrineClarity,
            GCatheterType: data.d.results[0]?.GCatheterType,
            GCatheterTypeTxt: data.d.results[0]?.GCatheterTypeTxt,
            GMicturition: data.d.results[0]?.GMicturition,
            GOther: data.d.results[0]?.GOther,
            GOtherTxt: data.d.results[0]?.GOtherTxt,
            SSkinColor: data.d.results[0]?.SSkinColor,
            SSkinColorTxt: data.d.results[0]?.SSkinColorTxt,
            STemperature: data.d.results[0]?.STemperature,
            SMoisture: data.d.results[0]?.SMoisture,
            SLesions: data.d.results[0]?.SLesions,
            SLocation: data.d.results[0]?.SLocation,
            NnHeadache: data.d.results[0]?.NnHeadache,
            NnDizziness: data.d.results[0]?.NnDizziness,
            NnNumbness: data.d.results[0]?.NnNumbness,
            NnNumbnessLoc: data.d.results[0]?.NnNumbnessLoc,
            NnTingling: data.d.results[0]?.NnTingling,
            NnTinglingLoc: data.d.results[0]?.NnTinglingLoc,
            NnParalysis: data.d.results[0]?.NnParalysis,
            NnParalysisLoc: data.d.results[0]?.NnParalysisLoc,
            NnTremors: data.d.results[0]?.NnTremors,
            NnTremorsLoc: data.d.results[0]?.NnTremorsLoc,
            NLevelConscious: data.d.results[0]?.NLevelConscious,
            NoPlace: data.d.results[0]?.NoPlace,
            NoTime: data.d.results[0]?.NoTime,
            NoPresent: data.d.results[0]?.NoPresent,
            NResponsiveness: data.d.results[0]?.NResponsiveness,
            CgChestPain: data.d.results[0]?.CgChestPain,
            CgPalpitations: data.d.results[0]?.CgPalpitations,

            CgPainCalves: data.d.results[0]?.CgPainCalves,
            CpRegular: data.d.results[0]?.CpRegular,
            CpIrregular: data.d.results[0]?.CpIrregular,
            CpStrong: data.d.results[0]?.CpStrong,
            CpWeak: data.d.results[0]?.CpWeak,
            CPedalPulses: data.d.results[0]?.CPedalPulses,
            CeYes: data.d.results[0]?.CeYes,
            CeNo: data.d.results[0]?.CeNo,
            CePitting: data.d.results[0]?.CePitting,
            CeNonPitting: data.d.results[0]?.CeNonPitting,
            CeLocation: data.d.results[0]?.CeLocation,
            CNailBed: data.d.results[0]?.CNailBed,
            CCapillaryRefill: data.d.results[0]?.CCapillaryRefill,
            EeHardHearing: data.d.results[0]?.EeHardHearing,
            EePain: data.d.results[0]?.EePain,
            EeDrainage: data.d.results[0]?.EeDrainage,
            EeDeaf: data.d.results[0]?.EeDeaf,
            EnEpistaxis: data.d.results[0]?.EnEpistaxis,
            EnCongestion: data.d.results[0]?.EnCongestion,
            EnDrainage: data.d.results[0]?.EnDrainage,
            EnType: data.d.results[0]?.EnType,
            EtDysphagia: data.d.results[0]?.EtDysphagia,
            EtBleeding: data.d.results[0]?.EtBleeding,
            EtSwollenGlands: data.d.results[0]?.EtSwollenGlands,
            EtSwollenGums: data.d.results[0]?.EtSwollenGums,
            EtPain: data.d.results[0]?.EtPain,
            EtLesions: data.d.results[0]?.EtLesions,
            EtLocation: data.d.results[0]?.EtLocation,
            OGlassEye: data.d.results[0]?.OGlassEye,
            ORedness: data.d.results[0]?.ORedness,
            OPain: data.d.results[0]?.OPain,
            ODischarge: data.d.results[0]?.ODischarge,
            OBlind: data.d.results[0]?.OBlind,
            OComments: data.d.results[0]?.OComments,
            RChestAppearance: data.d.results[0]?.RChestAppearance,
            RbDyspneaRest: data.d.results[0]?.RbDyspneaRest,
            RbDyspneaExertion: data.d.results[0]?.RbDyspneaExertion,
            RbNonLabored: data.d.results[0]?.RbNonLabored,
            RBbreathSounds: data.d.results[0]?.RBbreathSounds,
            RRhonchi: data.d.results[0]?.RRhonchi,
            RCough: data.d.results[0]?.RCough,
            RColor: data.d.results[0]?.RColor,
            RAmount: data.d.results[0]?.RAmount,
            RTracheostomy: data.d.results[0]?.RTracheostomy,
            RTubeSize: data.d.results[0]?.RTubeSize,
            RO2: data.d.results[0]?.RO2,
            RBy: data.d.results[0]?.RBy,
            ROtherTxt: data.d.results[0]?.ROtherTxt,
            RAt: data.d.results[0]?.RAt,
            FunSelfNoProblem: data.d.results[0]?.FunSelfNoProblem,
            FunSelfNeedsSuper: data.d.results[0]?.FunSelfNeedsSuper,
            FunSelfNeedsFeeding: data.d.results[0]?.FunSelfNeedsFeeding,
            FunSelfNeedsHygiene: data.d.results[0]?.FunSelfNeedsHygiene,
            FunSelfNeedsToileting: data.d.results[0]?.FunSelfNeedsToileting,
            FunSelfNeedsAmulation: data.d.results[0]?.FunSelfNeedsAmulation,
            FunMusNoProblem: data.d.results[0]?.FunMusNoProblem,
            FunMusProblemIdentified: data.d.results[0]?.FunMusProblemIdentified,
            FunMusProblems: data.d.results[0]?.FunMusProblems,
            FunAssEquipmentNone: data.d.results[0]?.FunAssEquipmentNone,
            FunAssEquipmentUseOf: data.d.results[0]?.FunAssEquipmentUseOf,
            FunAssEquipmentUseOfTyp: data.d.results[0]?.FunAssEquipmentUseOfTyp,
            FunAssEquipmentUseOfTxt: data.d.results[0]?.FunAssEquipmentUseOfTxt,
            FunDrNotification: data.d.results[0]?.FunDrNotification,
            FunNotified: data.d.results[0]?.FunNotified,
            ImpairedNutritional0: data.d.results[0]?.ImpairedNutritional0,
            ImpairedNutritional1: data.d.results[0]?.ImpairedNutritional1,
            ImpairedNutritional2: data.d.results[0]?.ImpairedNutritional2,
            ImpairedNutritional3: data.d.results[0]?.ImpairedNutritional3,
            ImpairedNutritionalScore: data.d.results[0]?.ImpairedNutritionalScore,
            SeverityDisease0: data.d.results[0]?.SeverityDisease0,
            SeverityDisease1: data.d.results[0]?.SeverityDisease1,
            SeverityDisease2: data.d.results[0]?.SeverityDisease2,
            SeverityDisease3: data.d.results[0]?.SeverityDisease3,
            SeverityDiseaseScore: data.d.results[0]?.SeverityDiseaseScore,
            TotalScore: data.d.results[0]?.TotalScore,
            AgeAdjustedScore: data.d.results[0]?.AgeAdjustedScore,
            PhysicianInformed: data.d.results[0]?.PhysicianInformed,
            NamePhysician: data.d.results[0]?.NamePhysician,
            PComments: data.d.results[0]?.PComments,
            SSleepRest: data.d.results[0]?.SSleepRest,
            SSleepTime: data.d.results[0]?.SSleepTime,
            SNumberHours: data.d.results[0]?.SNumberHours,
            SComments: data.d.results[0]?.SComments,
            OIdBand: data.d.results[0]?.OIdBand,
            OBathroom: data.d.results[0]?.OBathroom,
            OBatchCallLight: data.d.results[0]?.OBatchCallLight,
            ONurseCall: data.d.results[0]?.ONurseCall,
            OMealTimes: data.d.results[0]?.OMealTimes,
            OVisitingHours: data.d.results[0]?.OVisitingHours,
            OTvControl: data.d.results[0]?.OTvControl,
            ONonSmokingPolicy: data.d.results[0]?.ONonSmokingPolicy,
            OEqual: data.d.results[0]?.OEqual,
            OTelephone: data.d.results[0]?.OTelephone,
            OFallRiskScore: data.d.results[0]?.OFallRiskScore,
            MaritalStatus: data.d.results[0]?.MaritalStatus,
            Since: data.d.results[0]?.Since,
            NumberSpouse: data.d.results[0]?.NumberSpouse,
            HComments: data.d.results[0]?.HComments,
            AttendPhy: data.d.results[0]?.AttendPhy,
            DocStatus: data.d.results[0]?.DocStatus
          });
          this.nursingAdmissionForm.patchValue({
            ADate: this.parseDate(data.d.results[0].ADate),
            ATime: this.parseTime(data.d.results[0].ATime),
          });
          this.toAllergyArr = data.d.results[0].TOALLERGIES.results;
          if(data?.d?.results[0].TOSOCIAL.results.length) {
            let checkAlcoholData = data?.d?.results[0].TOSOCIAL.results.find(res => res.Type == 'Alcohol');
            if (checkAlcoholData) {
              this.socialHistoryList[0].DateFrom = checkAlcoholData.DateFrom;
              this.socialHistoryList[0].Status = checkAlcoholData.Status;
              this.socialHistoryList[0].Quantity = checkAlcoholData.Quantity;
              this.socialHistoryList[0].Duration = checkAlcoholData.Duration;
              this.socialHistoryList[0].Habitid = checkAlcoholData.Habitid;
            }
            let checkDrugsData = data?.d?.results[0].TOSOCIAL.results.find(res => res?.Type?.split('/')[0].trim() === 'Drug');
            if (checkDrugsData) {
              this.socialHistoryList[1].DateFrom = checkDrugsData.DateFrom;
              this.socialHistoryList[1].Status = checkDrugsData.Status;
              this.socialHistoryList[1].Quantity = checkDrugsData.Quantity;
              this.socialHistoryList[1].Duration = checkDrugsData.Duration;
              this.socialHistoryList[1].Habitid = checkDrugsData.Habitid;
            }
            let checkTobaccoData = data?.d?.results[0].TOSOCIAL.results.find(res => res?.Type?.split('/')[0].trim() === 'Tobacco');
            if (checkTobaccoData) {
              this.socialHistoryList[2].DateFrom = checkTobaccoData.DateFrom;
              this.socialHistoryList[2].Status = checkTobaccoData.Status;
              this.socialHistoryList[2].Quantity = checkTobaccoData.Quantity;
              this.socialHistoryList[2].Duration = checkTobaccoData.Duration;
              this.socialHistoryList[2].Habitid = checkTobaccoData.Habitid;
            }
            let checkOtherData = data?.d?.results[0].TOSOCIAL.results.find(res => res?.Type?.split('/')[0].trim() === 'Other');
            if (checkOtherData) {
              this.socialHistoryList[3].DateFrom = checkOtherData.DateFrom;
              this.socialHistoryList[3].Status = checkOtherData.Status;
              this.socialHistoryList[3].Quantity = checkOtherData.Quantity;
              this.socialHistoryList[3].Duration = checkOtherData.Duration;
              this.socialHistoryList[3].Habitid = checkOtherData.Habitid;
            }
          }
          if(data?.d?.results[0].TOSCALE.results.length) {
            data?.d?.results[0].TOSCALE.results.forEach((element) => {
              this.scalesList.forEach((res: any) => {
                if (element.ScaleType == res.ScaleType && element.LastScore) {
                  res.Datetimee = element.Datetimee,
                    res.Dockey = element.Dockey,
                    res.ScoreDesc = element.ScoreDesc,
                    res.LastScore = element.LastScore,
                    res.ScaleType = element.ScaleType
                }
              })
            })
          }
          this.bindDataToFormArray(data?.d?.results[0].TOINFECTION.results)
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing care plans: ${err}`
          );
        },
      });
  }

  bindDataToFormArray(data: any[]): void {
    if(data.length) {
      this.items.clear(); // Clear the existing form array
  
      data.forEach(item => {
        this.items.push(this.formBuilder.group({
          Dockey: [item.Dockey],
          InfectiousDiesease: [item.InfectiousDiesease],
          Status: [item.Status],
          TypeIsolation: [item.TypeIsolation]
        }));
      });
    }
  }

  get items(): FormArray {
    return this.nursingAdmissionForm.get('TOINFECTION') as FormArray;
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
    
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss a');
    this.nursingAdmissionForm = this.formBuilder.group({
      Dockey: '',
      Dtid: 'ZMED_NRADM',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      AAdmittedWard: '',
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
      // ASchoolGrade: '',
      AEducated: '',
      AFavouriteToy: '',
      AReasonVisit: '',
      AChiefComplaint: ['', Validators.required],
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
      ImpairedNutritionalScore: ['', Validators.required],
      SeverityDisease0: false,
      SeverityDisease1: false,
      SeverityDisease2: false,
      SeverityDisease3: false,
      SeverityDiseaseScore: ['', Validators.required],
      TotalScore: ['', Validators.required],
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
  isDockeyAvailable(): boolean {
    return this.scalesList.some(scale => scale.Dockey && scale.Dockey.trim() !== '');
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
      customClass: { popup: 'myalertpopup' },
    });
  }

  // public glasgowValue(event) {
  //   this.scalesList[0].LastScore = event?.totalScore.toString();
  //   this.scalesList[0].ScoreDesc = event?.ScoreDesc;
  //   this.scalesList[0].Dockey = event?.dockey;
  //   this.scalesList[0].Datetimee = event?.date;
  // }

  // public facePainValue(event) {
  //   this.scalesList[1].LastScore = event?.totalScore;
  //   this.scalesList[1].ScoreDesc = event?.ScoreDesc;
  //   this.scalesList[1].Dockey = event?.dockey;
  //   this.scalesList[1].Datetimee = event?.date;
  // }

  // public numericValue(event) {
  //   this.scalesList[2].LastScore = event?.totalScore;
  //   this.scalesList[2].ScoreDesc = event?.ScoreDesc;
  //   this.scalesList[2].Dockey = event?.dockey;
  //   this.scalesList[2].Datetimee = event?.date;
  // }

  public scaleStoreInTable(event: any, scaleType: string) {
    if(scaleType == 'morseFall') {
      this.scalesList[1].LastScore = event?.totalScore;
      this.scalesList[1].ScoreDesc = event?.description;
      this.scalesList[1].Dockey = event?.dockey;
      this.scalesList[1].Datetimee = event?.date;
    } else if (scaleType == 'braden') {
      this.scalesList[2].LastScore = event?.totalScore;
      this.scalesList[2].ScoreDesc = event?.description;
      this.scalesList[2].Dockey = event?.dockey;
      this.scalesList[2].Datetimee = event?.date;
    } else if (scaleType == 'glosgow') {
      this.scalesList[0].LastScore = event?.totalScore;
      this.scalesList[0].ScoreDesc = event?.description;
      this.scalesList[0].Dockey = event?.dockey;
      this.scalesList[0].Datetimee = event?.date;
    }
  }

  removeScale(index: number) {
    this.scalesList[index].LastScore = "";
    this.scalesList[index].ScoreDesc = "";
    this.scalesList[index].Dockey = "";
    this.scalesList[index].Datetimee = "";
  }

  public openScaleModel(item: any) {
    if (this.noScaleAppicable) return;
    if (item.Dockey) {
      this.scalesEditConfirmationMsg(item);
    } else {
      this.openSelectedModalScale(item);
    }
  }

  private scalesEditConfirmationMsg(item: { value: string }) {
    Swal.fire({
      text: 'Are you sure you want to edit scale',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
    }).then((res) => {
      if (res.isConfirmed) {
        this.openSelectedModalScale(item);
      }
    });
  }

  openSelectedModalScale(item) {
    if (item.value == '1') {
      this.scalesGlosgow.openModalForGlosgow('');
    } else if (item.value == '2') {
      this.morseFallScale.openMorseFallScaleModal('');
    } else if (item.value == '3') {
      this.bradenScaleTemp.openBradenScaleModal('');
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
        RespEmp: this.storageService.getGpart(),
        DepartOu: this.patientDetails.deptOrgUnit,
        TreatOu: this.patientDetails.deptOrgUnit,
        DrinkNo: true,
        NoConsumptionKnown: '',
      },
    };
    this.emergencyService.saveAlcoholWithDrink(payload).subscribe((res: any) => {
      this.sharedService.successSwallModel(
        'Alcohol habit with no drink saved successfully.'
      );
      this.getSocialHistoryHabitList(res?.d?.Habitid);
    });
  }

  public saveTabaccolWithNoSmoke() {
    let payload = {
      d: {
        Habitid: this.socialHistoryList[2].Habitid,
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        RespEmp: this.storageService.getGpart(),
        DepartOu: this.patientDetails.deptOrgUnit,
        TreatOu: this.patientDetails.deptOrgUnit,
        SmokeNo: true,
        NoConsumptionKnown: '',
      },
    };
    this.emergencyService.saveTabaccoHabit(payload).subscribe((res: any) => {
      this.sharedService.successSwallModel(
        'Tobacco habit with no smoke saved successfully.'
      );
      this.getSocialHistoryHabitList(res?.d?.Habitid);
    });
  }

  public saveDrugsWithNoDrugs() {
    let payload = {
      d: {
        Habitid: this.socialHistoryList[1].Habitid,
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        RespEmp: this.storageService.getGpart(),
        DepartOu: this.patientDetails.deptOrgUnit,
        TreatOu: this.patientDetails.deptOrgUnit,
        DrugNo: true,
        NoConsumptionKnown: '',
      },
    };
    this.emergencyService.saveDrugsHabit(payload).subscribe((res: any) => {
      this.sharedService.successSwallModel(
        'Drugs habit with no drugs saved successfully.'
      );
      this.getSocialHistoryHabitList(res?.d?.Habitid);
    });
  }

  public saveOtherWithNoOther() {
    let payload = {
      d: {
        Habitid: this.socialHistoryList[3].Habitid,
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        RespEmp: this.storageService.getGpart(),
        DepartOu: this.patientDetails.deptOrgUnit,
        TreatOu: this.patientDetails.deptOrgUnit,
        NotConsumes: 'X',
        NoConsumptionKnown: '',
      },
    };
    this.emergencyService.saveOtherHabit(payload).subscribe((res: any) => {
      this.sharedService.successSwallModel(
        'Other habit with not consumes saved successfully.'
      );
      this.getSocialHistoryHabitList(res?.d?.Habitid);
    });
  }

  // social history habit list API for table
  public getSocialHistoryHabitList(Habitid?: any) {
    this.emergencyService
      .getSocialHabitList(this.paramsObject.patnr)
      .subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          this.socialHabitList = data?.d?.results;
          let checkAlcoholData = data?.d?.results.find(
            (res) => res.Type == 'Alcohol' && res.Habitid == Habitid
          );
          if (checkAlcoholData) {
            this.socialHistoryList[0].DateFrom = checkAlcoholData.DateFrom;
            this.socialHistoryList[0].Status = checkAlcoholData.Status;
            this.socialHistoryList[0].Quantity = checkAlcoholData.Quantity;
            this.socialHistoryList[0].Duration = checkAlcoholData.Duration;
            this.socialHistoryList[0].Habitid = checkAlcoholData.Habitid;
          }
          let checkDrugsData = data?.d?.results.find(
            (res) => res.Type.split('/')[0].trim() === 'Drug' && res.Habitid == Habitid
          );
          if (checkDrugsData) {
            this.socialHistoryList[1].DateFrom = checkDrugsData.DateFrom;
            this.socialHistoryList[1].Status = checkDrugsData.Status;
            this.socialHistoryList[1].Quantity = checkDrugsData.Quantity;
            this.socialHistoryList[1].Duration = checkDrugsData.Duration;
            this.socialHistoryList[1].Habitid = checkDrugsData.Habitid;
          }
          let checkTobaccoData = data?.d?.results.find(
            (res) => res.Type.split('/')[0].trim() === 'Tobacco' && res.Habitid == Habitid
          );
          if (checkTobaccoData) {
            this.socialHistoryList[2].DateFrom = checkTobaccoData.DateFrom;
            this.socialHistoryList[2].Status = checkTobaccoData.Status;
            this.socialHistoryList[2].Quantity = checkTobaccoData.Quantity;
            this.socialHistoryList[2].Duration = checkTobaccoData.Duration;
            this.socialHistoryList[2].Habitid = checkTobaccoData.Habitid;
          }
          let checkOtherData = data?.d?.results.find(
            (res) => res.Type.split('/')[0].trim() === 'Other' && res.Habitid == Habitid
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

  createNursingAdmissionDoc(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      this.isFormValidError = true;
      if(this.nursingAdmissionForm.invalid) {
        if(!this.nursingAdmissionForm.value.ImpairedNutritionalScore || !this.nursingAdmissionForm.value.SeverityDiseaseScore) {
          Swal.fire({
            html: `Please add the <strong>Total Score</strong> in the <strong>Nutritional Risk Screening</strong> tab.`,
            icon: 'warning',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' },
          })
        }
        return;
      }
      this.nursingAdmissionForm.value.DocStatus = docStatus;
      let paylaod = this.nursingAdmissionForm.value;
      paylaod.Orgdo = this.storageService.patientData.deptOrgUnit;
      paylaod.AttendPhy = this.storageService.getUserProfile().Gpart;
      paylaod.ADate = this.sanitizeSAPDateFormat(this.nursingAdmissionForm.value.ADate);
      paylaod.ATime = this.parsePayloadFormateTime(this.nursingAdmissionForm.value.ATime);
      delete paylaod.disabledAllPhy
      delete paylaod.TOMEDICATION
      paylaod.TOALLERGIES = this.toAllergyArr;
      paylaod.TOSCALE = this.scalesList.filter((res: any) => {
        delete res.value;
        res.LastScore = res?.LastScore.toString();
        if(res.LastScore) {
          return res;
        }
      });
      let updatedList = this.socialHistoryList.map(item => {
        const { Status, value, label, Quantity, DateFrom, Habitid, ...rest } = item;
        if (item.Status) {
          return { ...rest, Description: Status, ConsumptionQty: Quantity, Dockey: '', Year: null };
        }
      });
      updatedList = updatedList.filter(item => item !== undefined);
      paylaod.TOSOCIAL = updatedList;
      paylaod.TOINFECTION = this.nursingAdmissionForm.value.TOINFECTION.filter(item => item.InfectiousDiesease);
      paylaod.Orgdo = this.storageService?.patientData?.deptOrgUnit;
      this.subscription = this.dayCaseDashboard
      .createNursingAdmissionDoc(paylaod)
      .subscribe({
        next: (data: any) => {},
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `PUT Error at Nursing admission document : ${err}`
          );
        },
        complete: () => {
          resolve(true);
          if (actiontype === 'edit') {
            this.sharedService.successSwallModel(
              'Nursing admission document updated successfully'
            );
          } else {
            this.sharedService.successSwallModel(
              'Nursing admission document created successfully'
            );
          }
        },
      });
    });
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
    let patnr = this.ePrescriptionService.parameters.patnr;
    patnr = patnr.padStart(10, '0');  
    const scalesOrders: Subscription = this.ePrescriptionService.loadData(`e-prescription/ScalesList?Patnr=${patnr}`, false, false, false, false).subscribe((resp: any) => {
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


  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  formatDateToMilliseconds(dateString: string): string {
    console.log(dateString, "--")
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

  parseDate(date: string) {
    if (date) {
      if(new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"))) {
        return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
      }
    }
  }
}
