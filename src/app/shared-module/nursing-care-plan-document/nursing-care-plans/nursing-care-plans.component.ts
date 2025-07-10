import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-nursing-care-plans',
  templateUrl: './nursing-care-plans.component.html',
  styleUrls: ['./nursing-care-plans.component.scss'],
})
export class NursingCarePlansComponent implements OnInit {
  @Input() isReadOnly : boolean =false;
  
  tabLabelList = [
    'Nutrition',
    'Elimination & Exchange; Diarrhea',
    'Activity/Rest',
    'Coping/Stress Tolerance',
    'Comfort; Acute Pain',
    'Safety/Protection; Bleeding',
    'Safety/Protection; Tissue Integrity',
    'Safety/Protection; Fall Risk',
    'Safety/Protection; Hyperthermia',
    'Safety/Protection; Hypothermia',
    'Safety/Protection; Aspiration',
    'Safety/Protection; Injection',
    'Activity/Rest; Sleep Pattern Disturbance',
    'Activity/Rest; Impaired Physical Mobility',
    'Activity/Rest; Inffective Breathing Patterns',
    'Comfort; Chest Pain',
    'Elimination & Exchange; Dehdration',
    'Elimination & Exchange; Nausea & Vomating',
    'Safety/Protection; VTE Risk',
    'Safety/Protection; Disrhythmias',
    'Safety/Protection; Unstable B.Glucose',
    'Nutrition; Ineffecive Infant Feeding Pattern',
    'Nutrition; Electrolyte Imbalance',
    'Perception/Cognition; Knowledge Deficit',
  ];
  selectedTabName: string = 'Nutrition';
  selectedOption: any;

  nursingCarePlanForm: FormGroup;

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  paramsObject: any;
  encounterId: any;
  patientDetails: Patient;
  maritalStatus: string;
  docKey: any;

  constructor(
    private formBuilder: FormBuilder,
    private dataShareService: DataShareService,
    private sharedService: SharedService,
    private emergencyService: EmergencyService,
    private dayCaseDashboard: DayCaseDashboardService,
    private storageService: StorageService,
    private _route: ActivatedRoute,
    private admissionService: AdmissionService,
    private patientService: PatientService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId =
          this.paramsObject.einri +
          this.paramsObject.falnr +
          this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
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
            this.getNursingCarePlanDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getNursingCarePlanDocDetails(data.value.docKey);
          }
        }
      }
    );
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

  getNursingCarePlanDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .getNursingCarePlanDetail(docKey)
      .subscribe({
        next: (data: any) => {
          this.nursingCarePlanForm.patchValue(data.d.results[0]);
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing care plans: ${err}`
          );
        },
      });
  }

  ngOnInit(): void {
    if(this.isReadOnly){
      this.getNursingCarePlanDocDetails(this.admissionService.selectedCurrentDocDetails.Dockey)
    }
  }

  createNursingCarePlan(status: string, actiontype?: string) {
    return new Promise((resolve, reject) => {
      this.nursingCarePlanForm.value.DocStatus = status;
      this.nursingCarePlanForm.value.Orgdo = this.storageService?.patientData?.deptOrgUnit
      if(actiontype == 'copy') {
        // this.nursingCarePlanForm.value.Dockey = '';
      }
      let paylaod = {
        d: this.nursingCarePlanForm.value,
      };
      paylaod.d.Orgdo = this.storageService.patientData.deptOrgUnit;
      paylaod.d.AttendPhy = this.storageService.getUserProfile().Gpart;
      this.subscription = this.dayCaseDashboard
        .createNursingCarePlan(paylaod)
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
                'Nursing care plan updated successfully'
              );
            } else {
              this.sharedService.successSwallModel(
                'Nursing care plan created successfully'
              );
            }
          },
        });
    });
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
    this.nursingCarePlanForm = this.formBuilder.group({
      Dockey: '',
      Dtid: 'ZMED_NCP',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      NpImbalanced: false,
      NpActual: false,
      NpPotential: false,
      NgImprove: false,
      NgNutritionSupport: false,
      NgOralIntake: false,
      NgOthers: false,
      NgOthersTxt: '',
      NiCounseling: false,
      NiMonitorIntake: false,
      NiDailyBody: false,
      NiParenteralFluid: false,
      NiDetermineFood: false,
      NiMonitorElectro: false,
      NiReferDietician: false,
      NiPatientFamily: false,
      NiProvideSkin: false,
      NiSwallowingTherapy: false,
      NiOthers: false,
      NiOthersTxt: '',
      NeMet: false,
      NePartiallyMet: false,
      NeNotMet: false,
      NrContinue: false,
      NrEdited: false,
      NrAchieved: false,

      EpDiarrhea: false,
      EpActual: false,
      EpPotential: false,
      EgDiarrheal: false,
      EgUsualBowel: false,
      EgMaintainFluid: false,
      EgKeepSkin: false,
      EgOthers: false,
      EgOthersTxt: '',
      EiMonitor: false,
      EiAdminister: false,
      EiReplace: false,
      EiIntake: false,
      EiMonitorSkin: false,
      EiProvideMeticulous: false,
      EiEducatePatient: false,
      EiProvidePsycological: false,
      EiReferDietician: false,
      EiOthers: false,
      EiOthersTxt: '',
      EeMet: false,
      EePartiallyMet: false,
      EeNotMet: false,
      ErContinue: false,
      ErEdited: false,
      ErAchieved: false,

      ApActivityIntoler: false,
      ApActual: false,
      ApPotential: false,
      AgUnderstanding: false,
      AgDemonstrate: false,
      AgOthers: false,
      AgOthersTxt: '',
      AiEncouraging: false,
      AiEvaluating: false,
      AiProvidingSuffic: false,
      AiMoving: false,
      AiProvidingAssist: false,
      AiEducate: false,
      AiAdequate: false,
      AiEncourage: false,
      AiMonitor: false,
      AiPhysiotherapy: false,
      AiOthers: false,
      AiOthersTxt: '',
      AeMet: false,
      AePartiallyMet: false,
      AeNotMet: false,
      ArContinue: false,
      ArEdited: false,
      ArAchieved: false,

      CspAnxiety: false,
      CspActual: false,
      CspPotential: false,
      CsgExperience: false,
      CsgIdentifies: false,
      CsgDevelop: false,
      CsgVerbalize: false,
      CsgOthers: false,
      CsgOthersTxt: '',
      CsiReduce: false,
      CsiComplementary: false,
      CsiRelaxation: false,
      CsiCounseling: false,
      CsiFamily: false,
      CsiPromote: false,
      CsiListen: false,
      CsiInvolve: false,
      CsiOthers: false,
      CsiOthersTxt: '',
      CseMet: false,
      CsePartiallyMet: false,
      CseNotMet: false,
      CsrContinue: false,
      CsrEdited: false,
      CsrAchieved: false,

      CapAcutePain: false,
      CapActual: false,
      CapPotential: false,
      CagBeRelief: false,
      CagOptimal: false,
      CagOthers: false,
      CagOthersTxt: '',
      CaiAssess: false,
      CaiCheckVital: false,
      CaiPatient: false,
      CaiPharmacologic: false,
      CaiPainPump: false,
      CaiNonPharmacologic: false,
      CaiCold: false,
      CaiHeat: false,
      CaiMassage: false,
      CaiPlayTherapy: false,
      CaiEssential: false,
      CaiPosition: false,
      CaiQuiet: false,
      CaiRelaxation: false,
      CaiPillowSupport: false,
      CaiOthers: false,
      CaiOthersTxt: '',
      CaeMet: false,
      CaePartiallyMet: false,
      CaeNotMet: false,
      CarContinue: false,
      CarEdited: false,
      CarAchieved: false,

      BlpBleeding: false,
      BlpActual: false,
      BlpPotential: false,
      BlgMaintain: false,
      BlgDemonstrate: false,
      BlgOther: false,
      BlgOtherTxt: '',
      BliMonitor: false,
      BliEvaluate: false,
      BliReview: false,
      BliCheckStool: false,
      BliMonitorHemato: false,
      BliEducate: false,
      BliProvideThe: false,
      BliProvideGood: false,
      BliApplyHeavy: false,
      BliMonitorSite: false,
      BliOthers: false,
      BliOthersTxt: '',
      BleMet: false,
      BlePartiallyMet: false,
      BleNotMet: false,
      BlrContinue: false,
      BlrEdited: false,
      BlrAchieved: false,

      TipImpaired: false,
      TipActual: false,
      TipPotential: false,
      TigOptimize: false,
      TigComplications: false,
      TigPatient: false,
      TigOthers: false,
      TigOthersTxt: '',
      TiiGently: false,
      TiiAssist: false,
      TiiLift: false,
      TiiKeepPatient: false,
      TiiKeepBed: false,
      TiiTubing: false,
      TiiProtect: false,
      TiiHeels: false,
      TiiPressure: false,
      TiiElectrode: false,
      TiiNutritional: false,
      TiiPressureRedi: false,
      TiiOthers: false,
      TiiOthersTxt: '',
      TieMet: false,
      TiePartiallyMet: false,
      TieNotMet: false,
      TirContinue: false,
      TirEdited: false,
      TirAchieved: false,

      FrpFallInjury: false,
      FrpActual: false,
      FrpPotential: false,
      FrgAbsence: false,
      FrgPromote: false,
      FrgOthers: false,
      FrgOthersTxt: '',
      FriRemove: false,
      FriMaintain: false,
      FriPutOn: false,
      FriEvaluate: false,
      FriThoroughly: false,
      FriShowHow: false,
      FriProvide: false,
      FriRoutinely: false,
      FriEncourage: false,
      FriPatient: false,
      FriOthers: false,
      FriOthersTxt: '',
      FreMet: false,
      FrePartiallyMet: false,
      FreNotMet: false,
      FrrContinue: false,
      FrrEdited: false,
      FrrAchieved: false,

      HepHyperthermia: false,
      HepActual: false,
      HepPotential: false,
      HegMaintain: false,
      HegIncreased: false,
      HegComplications: false,
      HegDehydration: false,
      HegOthers: false,
      HegOthersTxt: '',
      HeiProvide: false,
      HeiMonitor: false,
      HeiAssess: false,
      HeiEncourage: false,
      HeiAdminister: false,
      HeiRemove: false,
      HeiEducate: false,
      HeiOthers: false,
      HeiOthersTxt: '',
      HeeMet: false,
      HeePartiallyMet: false,
      HeeNotMet: false,
      HerContinue: false,
      HerEdited: false,
      HerAchieved: false,

      HopHypothermia: false,
      HopActual: false,
      HopPotential: false,
      HogMaintain: false,
      HogIncreased: false,
      HogPrevent: false,
      HogOthers: false,
      HogOthersTxt: '',
      HoiMonitor: false,
      HoiRewarm: false,
      HoiAssess: false,
      HoiEncourage: false,
      HoiEducate: false,
      HoiApply: false,
      HoiAssessPoss: false,
      HoiOthers: false,
      HoiOthersTxt: '',
      HoeMet: false,
      HoePartiallyMet: false,
      HoeNotMet: false,
      HorContinue: false,
      HorEdited: false,
      HorAchieved: false,

      AspAspiration: false,
      AspActual: false,
      AspPotential: false,
      AsgPatient: false,
      AsgOthers: false,
      AsgOthersTxt: '',
      AsiMonitorPatient: false,
      AsiPerform: false,
      AsiMonitor: false,
      AsiHead: false,
      AsiTurn: false,
      AsiSuction: false,
      AsiEnsure: false,
      AsiEnteral: false,
      AsiAssess: false,
      AsiEncourage: false,
      AsiAdministre: false,
      AsiPateint: false,
      AsiConsult: false,
      AsiOthers: false,
      AsiOthersTxt: '',
      AseMet: false,
      AsePartiallyMet: false,
      AseNotMet: false,
      AsrContinue: false,
      AsrEdited: false,
      AsrAchieved: false,

      InpInfection: false,
      InpActual: false,
      InpPotential: false,
      IngPateint: false,
      IngPateintDemonst: false,
      IngAppropriate: false,
      IngOthers: false,
      IngOthersTxt: '',
      IniStrictlyAseptic: false,
      IniStrictlyApprpri: false,
      IniAdhere: false,
      IniEquipment: false,
      IniReport: false,
      IniUtilizeGood: false,
      IniEncourage: false,
      IniVisitors: false,
      IniOthers: false,
      IniOthersTxt: '',
      IneMet: false,
      InePartiallyMet: false,
      IneNotMet: false,
      InrContinue: false,
      InrEdited: false,
      InrAchieved: false,

      DepDehydration: false,
      DepActual: false,
      DepPotential: false,
      DegExhibit: false,
      DegMaintain: false,
      DegOthers: false,
      DegOthersTxt: '',
      DeiExamine: false,
      DeiSupport: false,
      DeiMeasure: false,
      DeiMonitor: false,
      DeiObtain: false,
      DeiAdminister: false,
      DeeMet: false,
      DeePartiallyMet: false,
      DeeNotMet: false,
      DerContinue: false,
      DerEdited: false,
      DerAchieved: false,

      NvpNausea: false,
      NvpActual: false,
      NvpPotential: false,
      NvgPatient: false,
      NvgOthers: false,
      NvgOthersTxt: '',
      NviCollaborate: false,
      NviAssess: false,
      NviAdministerMed: false,
      NviStartWith: false,
      NviAvoidSpicy: false,
      NviUseSmall: false,
      NviCheckSigns: false,
      NviEnsure: false,
      NviKeep: false,
      NviEncourage: false,
      NviRestrict: false,
      NviAdminister: false,
      NviEducate: false,
      NviReport: false,
      NviPosition: false,
      NviOthers: false,
      NviOthersTxt: '',
      NveMet: false,
      NvePartiallyMet: false,
      NveNotMet: false,
      NvrContinue: false,
      NvrEdited: false,
      NvrAchieved: false,

      VtpVenous: false,
      VtpActual: false,
      VtpPotential: false,
      VtgPatient: false,
      VtgOthers: false,
      VtgOthersTxt: '',
      VtiEncourage: false,
      VtiApply: false,
      VtiAdminister: false,
      VtiCollaborate: false,
      VtiObtain: false,
      VtiSignsSymptoms: false,
      VtiComfortLevel: false,
      VtiMobilityStatus: false,
      VtiEducate: false,
      VtiOthers: false,
      VtiOthersTxt: '',
      VteMet: false,
      VtePartiallyMet: false,
      VteNotMet: false,
      VtrContinue: false,
      VtrEdited: false,
      VtrAchieved: false,

      DipDisrhythmias: false,
      DipActual: false,
      DipPotential: false,
      DigPatientWill: false,
      DigPatientFree: false,
      DigOthers: false,
      DigOthersTxt: '',
      DiiSupport: false,
      DiiTreat: false,
      DiiReview: false,
      DiiPrepare: false,
      DiiAssist: false,
      DiiBlood: false,
      DiiEcg: false,
      DiiVitalSigns: false,
      DiiAdminister: false,
      DiiPatient: false,
      DiiOthers: false,
      DiiOthersTxt: '',
      DieMet: false,
      DiePartiallyMet: false,
      DieNotMet: false,
      DirContinue: false,
      DirEdited: false,
      DirAchieved: false,

      UbpBloodGlucose: false,
      UbpActual: false,
      UbpPotential: false,
      UbgSymptoms: false,
      UbgSerum: false,
      UbgVerbalize: false,
      UbgOthers: false,
      UbgOthersTxt: '',
      UbiEducate: false,
      UbiMonitor: false,
      UbiEducatePatient: false,
      UbiObserve: false,
      UbiAdmister: false,
      UbiBlood: false,
      UbiPatientRefer: false,
      UbiIntake: false,
      UbiProtect: false,
      UbiOthers: false,
      UbiOthersTxt: '',
      UbeMet: false,
      UbePartiallyMet: false,
      UbeNotMet: false,
      UbrContinue: false,
      UbrEdited: false,
      UbrAchieved: false,

      SppSleep: false,
      SppActual: false,
      SppPotential: false,
      SpgRested: false,
      SpgVerbalization: false,
      SpgImprovement: false,
      SpgOthers: false,
      SpgOthersTxt: '',
      SpiAssist: false,
      SpiEvaluate: false,
      SpiAssess: false,
      SpiOffer: false,
      SpiInstruct: false,
      SpiDiscourage: false,
      SpiPerform: false,
      SpiReduce: false,
      SpiIncrease: false,
      SpiOthers: false,
      SpiOthersTxt: '',
      SpeMet: false,
      SpePartiallyMet: false,
      SpeNotMet: false,
      SprContinue: false,
      SprEdited: false,
      SprAchieved: false,

      ImpImpaired: false,
      ImpActual: false,
      ImpPotential: false,
      ImgMaxPhys: false,
      ImgOthers: false,
      ImgOthersTxt: '',
      ImiSafe: false,
      ImiEstablish: false,
      ImiMobility: false,
      ImiTeach: false,
      ImiPromote: false,
      ImiMedications: false,
      ImiHelp: false,
      ImiExplanation: false,
      ImiCall: false,
      ImiOthers: false,
      ImiOthersTxt: '',
      ImeMet: false,
      ImePartiallyMet: false,
      ImeNotMet: false,
      ImrContinue: false,
      ImrEdited: false,
      ImrAchieved: false,

      IbpIneffective: false,
      IbpActual: false,
      IbpPotential: false,
      IbgColor: false,
      IbgAbsence: false,
      IbiAssess: false,
      IbiPosition: false,
      IbiNebulization: false,
      IbiEncourage: false,
      IbiPrescribed: false,
      IbiAdministerPresc: false,
      IbiCollaborate: false,
      IbiPerform: false,
      IbiAuscultate: false,
      IbiFrequent: false,
      IbiMonitor: false,
      IbiOthers: false,
      IbiOthersTxt: '',
      IbeMet: false,
      IbePartiallyMet: false,
      IbeNotMet: false,
      IbrContinue: false,
      IbrEdited: false,
      IbrAchieved: false,

      CppChest: false,
      CppActual: false,
      CppPotential: false,
      CpgRelief: false,
      CpgOthers: false,
      CpgOthersTxt: '',
      CpiLeadEcg: false,
      CpiO2Therapy: false,
      CpiAdhere: false,
      CpiCardiac: false,
      CpiEnsure: false,
      CpiConnect: false,
      CpiOthers: false,
      CpiOthersTxt: '',
      CpeMet: false,
      CpePartiallyMet: false,
      CpeNotMet: false,
      CprContinue: false,
      CprEdited: false,
      CprAchieved: false,

      IipIneffective: false,
      IipActual: false,
      IipPotential: false,
      IigWeightLoss: false,
      IigSymptoms: false,
      IigNoImbalances: false,
      IigInfant: false,
      IigIncrease: false,
      IigOthers: false,
      IigOthersTxt: '',
      IiiWeigh: false,
      IiiSuckingPattern: false,
      IiiClarify: false,
      IiiSymptoms: false,
      IiiTrain: false,
      IiiRecord: false,
      IiiActivity: false,
      IiiCheckSigns: false,
      IiiAbdominal: false,
      IiiRecordNumber: false,
      IiiAdminister: false,
      IiiOthers: false,
      IiiOthersTxt: '',
      IieMet: false,
      IiePartiallyMet: false,
      IieNotMet: false,
      IirContinue: false,
      IirEdited: false,
      IirAchieved: false,

      ElpElectrolyte: false,
      ElpActual: false,
      ElpPotential: false,
      ElgNotExperience: false,
      ElgDemonstrate: false,
      ElgTwitching: false,
      ElgCardiac: false,
      ElgNormal: false,
      ElgOthers: false,
      ElgOthersTxt: '',
      EliAdminister: false,
      EliOral: false,
      EliVital: false,
      EliBlood: false,
      EliIntake: false,
      EliEcg: false,
      EliEducate: false,
      EliOthers: false,
      EliOthersTxt: '',
      EleMet: false,
      ElePartiallyMet: false,
      EleNotMet: false,
      ElrContinue: false,
      ElrEdited: false,
      ElrAchieved: false,

      KdpKnowledge: false,
      KdpActual: false,
      KdpPotential: false,
      KdgUnderstanding: false,
      KdgDemonstrates: false,
      KdgIdentifies: false,
      KdgOthers: false,
      KdgOthersTxt: '',
      KdiObjectives: false,
      KdiPhysical: false,
      KdiLearning: false,
      KdiAssign: false,
      KdiQuietAtmos: false,
      KdiAllow: false,
      KdiGiveClear: false,
      KdiDocument: false,
      KdiRapport: false,
      KdiOthers: false,
      KdiOthersTxt: '',
      KdeMet: false,
      KdePartiallyMet: false,
      KdeNotMet: false,
      KdrContinue: false,
      KdrEdited: false,
      KdrAchieved: false,
      AttendPhy: this.storageService.getUserProfile().Gpart,
      DocStatus: '',
    });
  }

  switchTabs(tabName: string) {
    this.selectedTabName = tabName;
  }
}
