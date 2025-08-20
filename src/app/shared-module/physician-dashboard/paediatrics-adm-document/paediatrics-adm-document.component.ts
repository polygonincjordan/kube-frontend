import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommanService } from '@services/comman.service';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { commonKeyValuePariExt0, commonKeyValuePariExt4 } from '@services/e-kardex/interfaces/documents.interface';
import { PatientService } from '@services/e-kardex/patient.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { PhysicianAllergyComponent } from './physician-allergy/physician-allergy.component';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import { Subscription } from 'rxjs';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';
import { AdmissionService } from '@services/admission/admission.service';
import { ActionType } from '@services/interfaces/common.enum';
import { PhysicianDiagnosisComponent } from './physician-diagnosis/physician-diagnosis.component';
import { PhysicianPastMedicalComponent } from './physician-past-medical/physician-past-medical.component';
import { PhysicianPastSurgicalComponent } from './physician-past-surgical/physician-past-surgical.component';
import { PhysicianFamilyHistoryComponent } from './physician-family-history/physician-family-history.component';

@Component({
  selector: 'app-paediatrics-adm-document',
  templateUrl: './paediatrics-adm-document.component.html',
  styleUrls: ['./paediatrics-adm-document.component.scss']
})
export class PaediatricsAdmDocumentComponent implements OnInit {
  @Output() reloadTableList = new EventEmitter();
  @Output() realodEducationList = new EventEmitter();
  public nursingAdmissionForm: FormGroup;
  @Input() soapFormEvent: string;
  @Input() isReadOnly: any = false;

  toAllergyArr: any = [];
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @ViewChild('diagnosisNotesKardexId') diagnosisNotesKardex: PhysicianDiagnosisComponent;
  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScalePopupComponent;
  @ViewChild('morseFallScale') morseFallScale: MorseFallScaleComponent;
  @ViewChild('bradenScaleTemp') bradenScaleTemp: BradenScaleComponent;
  @ViewChild('pastMedicalKardexId') pastMedicalKardex: PhysicianPastMedicalComponent;
  @ViewChild('pastSurgicalKardexId') pastSurgicalKardex: PhysicianPastSurgicalComponent;
  @ViewChild('familyHistoryKardexId') familyHistoryKardex: PhysicianFamilyHistoryComponent;
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
    { value: '01', label: 'Anxious', controlname: 'PsAnxious' },
    { value: '02', label: 'Uncooperative', controlname: 'PsUncooperative' },
    { value: '03', label: 'Depressed', controlname: 'PsDepressed' },
    { value: '04', label: 'Angry', controlname: 'PsAngry' },
    { value: '05', label: 'Agitated', controlname: 'PsAgitated' },
    { value: '06', label: 'Combative', controlname: 'PsCombative' },


    { value: '07', label: 'Other', controlname: 'PsOther' },
  ];

  selectedTabName: string = 'med';
  surgeryMedicalTabList = [
    {
      label: 'Past Medical Condition',
      value: 'med'
    },
    {
      label: 'Past Surgical History',
      value: 'surg'
    },
    {
      label: 'Family History',
      value: 'family'
    },
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
  duplicates: any[];
  selectedScales: any[] = [];
  scalesArray: any[] = [];
  private actionTypeSubscription$: Subscription;
  private subscription: Subscription;
  toScaleArr: any[];
  modalRefScales: BsModalRef;
  isChecked: any;
  isCheckedNoDiagnosis: Boolean;
  enableCreatePMed: boolean = false;
  enableCreatePSurg: boolean = false;
  enableCreateFamily: boolean = false;
  public toVitalsArr: any = [];
  private actionTypeData!: any; // working on here
  toDiagnosisArr: any = [];
  toPastMedical: any = [];
  toPastSurgical: any = [];
  toFamilyHistory: any = [];
  med: boolean = true;
  surg: boolean = false;
  family: boolean = false;
  allergyInformation: any;

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
    private admissionService: AdmissionService,
    private ePrescriptionService: EPrescriptionService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.encounterId =
        this.paramsObject.einri +
        this.paramsObject.falnr +
        this.paramsObject.lfdnr;
      // this.getPatinetDetails(this.encounterId);
    });
    this.initForm();


    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          this.actionTypeData = data;
          if (data.type == ActionType.Add$ && data.value) {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getPediatricAdmAssesDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getPediatricAdmAssesDocDetails(data.value.docKey);
          }
        }
      }
    );
  }


  ngOnInit(): void {
    if (this.isReadOnly) {
      this.getPediatricAdmAssesDocDetails(this.admissionService.selectedCurrentDocDetails.Dockey)
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.soapFormEvent.currentValue == 'add') {
      if (this.admissionService.isClonePaediatricsAdmissionForm) {
        this.CreatePediatricAdmAssesDoc('3')
      }
      else {
        this.CreatePediatricAdmAssesDoc('1')
      }
    }
    if (changes.soapFormEvent.currentValue == 'edit') {
      this.CreatePediatricAdmAssesDoc('1') // like add but with Dockey
    }

    if (changes.soapFormEvent.currentValue == 'release') {
      if (this.admissionService.isClonePaediatricsAdmissionForm) {
        this.CreatePediatricAdmAssesDoc('5')
      } else {
        if (this.admissionService.isEditPaediatricsAdmissionForm) {
          this.CreatePediatricAdmAssesDoc('2')
        } else {
          this.CreatePediatricAdmAssesDoc('4')
        }
      }
    }

    if (this.admissionService.isEditPaediatricsAdmissionForm || this.admissionService.isClonePaediatricsAdmissionForm) {
      this.getPediatricAdmAssesDocDetails(this.admissionService.selectedCurrentDocDetails.Dockey);
    }
  }

  initForm() {
    if (this.storageService.patientData.allergyInfo == 'The patient has no known allergies' || this.storageService.patientData.allergyInfo == 'The patient has no allergy assessment') {
      this.allergyInformation = 'No know allergies';
    } else if (this.storageService.patientData.allergyInfo == 'The patient has no possible allergy assessment') {
      this.allergyInformation = 'No possible allergy assessment';
    } else {
      this.allergyInformation = 'Allergy Exists';
    }
    const check = this.storageService.getGpart()

    this.nursingAdmissionForm = this.formBuilder.group({

      Dtid: 'ZMED_PDASM',
      Dockey: '',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: '1',
      Vaccinated: '',
      Accompanied: '',
      AccompaniedTxt: '',
      AdmissionMode: '',
      AdmissionModeTxt: '',
      ChiefComplaint: ['Chief complaint is:'],
      Datee: [this.convertDateFormat(JSON.parse(localStorage.getItem('checkindata'))?.AdmissionDate)],
      FavouriteToy: '',
      InfoObtained: '',
      InfoObtainedTxt: '',
      LanguageSpoken: '',
      ReasonVisit: '',
      EcFatherJob: '',
      EcInsurance: '',
      EcNoPeople: '',
      EcPhone: '',
      EcRelationship: '',
      EcRelationshipTxt: '',
      EneChangeHearing: false,
      EneDizziness: false,
      EnmBleedingGums: false,
      FaNotified: '',
      GHeartburn: false,
      GwMToiletTraining: false,
      NSwollenGlands: false,
      SrNumberHours: '',
      SrSleep: '',
      SrSleepTime: '',
      UDribbling: false,
      Substances: '',
      SdComments: '',
      SComments: '',
      EComments: '',
      NComments: '',
      BComments: '',
      RComments: '',
      GComments: '',
      UComments: '',
      MComments: '',
      HeComments: '',
      NuComments: '',
      EdComments: '',
      PComments: '',
      PsComments1: '',
      PsComments: '',
      SrComments: '',
      GwComments: '',
      SchoolGrade: '',
      EcLivingWith: '',
      STypeRash: '',
      HNoReportedAbnorm: false,
      HHeadInjury: false,
      HHeadCircumference: '0.00', // only positive numbers (int or float)
      ENoReportedAbnorm: false,
      EGlassesContacts: false,
      EChangeVision: false,
      EEyePain: false,
      EDoubleVision: false,
      EFlashingLights: false,
      EGlaucomaCataracts: false,
      ELastEyeExam: false,
      NLumps: false,
      NGoiter: false,
      NStiffness: false,
      BNoReportedAbnorm: false,
      BPain: false,
      BLumps: false,
      BNippleDischarge: false,
      BSkinAbnormalities: false,
      EneNoReportedAbnorma: false,
      EneTympanicMembrane: false,
      EneEarDischarge: false,
      EneRinging: false,
      EnnNoReportedAbnorm: false,
      EnnNoseBleeds: false,
      EnnNasalStuffiness: false,
      EnnNasalFlaring: false,
      EnnFrequentColds: false,
      NNoReportedAbnorm: false,
      EnmSoreTongue: false,
      EnmLipColor: '',
      GNoReportedAbnorm: false,
      GChangeAppetiteWeight: false,
      GProblemsSwallowing: false,
      GNausea: false,
      GVomiting: false,
      GVomitingBlood: false,
      GConstipation: false,
      GDiarrhea: false,
      GChangeBowelHabits: false,
      GAbdominalPain: false,
      GExcessiveBelching: false,
      GExcessiveFlatus: false,
      GYellowColourSkin: false,
      GFoodIntolerance: false,
      GRectalBleedingHemo: false,
      GToiletTrained: false,
      GTfreq: '',
      GUsesDiaper: false,
      GUfreq: '',
      UNoReportedAbnorm: false,
      UDifficultyUrination: false,
      UPainBurningUrination: false,
      UFrequentUrinationNight: false,
      UUrgentNeedUrinate: false,
      UIncontinenceUrine: false,
      UDecreasedUrineStream: false,
      UBloodUrine: false,
      UUtiStonesProstate: false,
      MNoReportedAbnorm: false,
      MPain: false,
      MSwelling: false,
      MStiffness: false,
      MDecreasedJointMotion: false,
      MBrokenBone: false,
      MSeriousSprains: false,
      MArthritis: false,
      MGout: false,
      NuNoReportedAbnorm: false,
      NuHeadaches: false,
      NuLossConsciousness: false,
      NuParalysis: false,
      NuLossMuscleSize: false,
      NuMuscleSpasm: false,
      NuInvoluntaryMovement: false,
      NuIncoordination: false,
      NuNumbness: false,
      NuFeelingPinsNeedles: false,
      HeNoReportedAbnorm: false,
      HeAnemia: false,
      HeEasyBruisingBleeding: false,
      EdNoReportedAbnorm: false,
      EdAbnormalGrowth: false,
      EdIncreasedAppetite: false,
      EdIncreasedThirst: false,
      EdIncreaseUrineProduction: false,
      EdThyroidTrouble: false,
      EdHeatColdIntolerance: false,
      EdExcessingSweating: false,
      EdDiabetes: false,
      SdInOtherTxt: '',
      SdToOtherTxt: '',
      SdPrOtherTxt: '',
      FaInfantLess: false,
      FaRecentChanges: '',
      FaRequiresDr: '',
      GwMSocialSmile: false,
      GwMTeething: false,
      GwMSetAlone: false,
      GwMWalked: false,
      GwMUsedWords: false,
      GwMUsedSentences: false,
      GwMPuberity: false,
      GwMOther: false,
      GwMOtherTxt: '',
      GwStatus: '',
      SsOthersTxt: '',
      OpPatientHandbook: '',
      OpPatientHandbookTxt: '',
      OpVValuables: '',
      OpVSentHomeTxt: '',
      OpVGivenByTxt: '',
      EnmNoReportedAbnorm: false,
      NuSeizures: false,
      NuTremor: false,
      NuWeakness: false,
      OpOBatch: false,
      OpOBathroom: false,
      OpOIdBand: false,
      OpOMealTimes: false,
      OpONonSmoking: false,
      OpONurseCall: false,
      OpOPatientEquipment: false,
      OpOTelephone: false,
      OpOTvControl: false,
      OpOVisitingHours: false,
      OpVGivenBy: false,
      OpVPatent: false,
      OpVSentHome: false,
      PClotsVeins: false,
      PLegCramps: false,
      PNoReportedAbnorm: false,
      PsAgitated: false,
      PsAngry: false,
      PsAnxious: false,
      PsChangeMood: false,
      PsCombative: false,
      PsDepressed: false,
      PsDepressionSuicide: false,
      PsMemoryProblems: false,
      PsNoProblem: false,
      PsNoReportedAbnorm: false,
      PsOther: false,
      PsPastTreatmentPsychiatri: false,
      PsSleepProblems: false,
      PsTensionAnxiety: false,
      PsUncooperative: false,
      PsUnusualProblems: false,
      PVaricoseVeins: false,
      RBlueFingersToes: false,
      RBronchitisEmphysema: false,
      RChestPain: false,
      RCough: false,
      RCoughingBlood: false,
      RHeartMurmur: false,
      RHxHeartMedication: false,
      RNightSweats: false,
      RNoReportedAbnorm: false,
      RProductionPhlegm: false,
      RShortnessBreath: false,
      RSkippingHeartBeats: false,
      RSwellingHandsFeet: false,
      RWheezing: false,
      SChangeHairNails: false,
      SdInHypertrophy: false,
      SdInOther: false,
      SdInSwollen: false,
      SdInVaginal: false,
      SdNoReported: false,
      SdPrDelayed: false,
      SdPrEarly: false,
      SdPrOther: false,
      SdToEarly: false,
      SdToOther: false,
      SItching: false,
      SNoReportedAbnorm: false,
      SRashes: false,
      SsInadequateCoping: false,
      SsInadequateFamily: false,
      SsInadequateFinancial: false,
      SsNoSocial: false,
      SsOthers: false,
      SsPatient: false,
      SsSocialWorker: false,
      SsSuspected: false,
      Phy: 'X',
      Timee: [this.convertTimeFormat(JSON.parse(localStorage.getItem('checkindata'))?.AdmissionTime)],

      AdmittedWard: '', // AdmittedWard (not binded) >>> ? keep it unbind
      Room: '',  // Room (not binded) >>> ? keep it unbind
      From: '', // Not binded (keep it unbind)
      HComments: '', // not clear (from new payload)  if not found witha anyone then bind this -> HComments -> Physical Assessment (Review of Systems) -> Head
      EnmComments: '', // not clear (not sure wich key is)
      RFever: false, // not clear (not sure wich key is)
      EnmHoarseness: false, // not clear (not sure wich key is)
      FaComments: '', // not clear (not sure wich key is)

      TOADMMED: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          EventDesc: '',
          Dose: ''
        })
      ]),


      TOALLERGY: this.formBuilder.array([
        this.formBuilder.group({
          Agroup: '',
          Description: '',
          Dockey: ''
        })
      ]),

      TOFUNASS: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          Describe: '',
          Functions: '',
          Score: ''
        })
      ]),

      TOINFECTIONS: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          InfectiousDiesease: '',
          Status: '',
          TypeIsolation: ''
        })
      ]),

      TOPHYEXAM: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          PhyComments: '',
          PhyDate: '',
          PhyTime: '',
          PhyDescription: '',
          PhyMode: ''
        })
      ]),

      TOSCALE: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          Datetimee: '',
          LastScore: '',
          ScaleType: '',
          ScoreDesc: ''
        })
      ]),

      TOVACCINATION: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          Other: '',
          Status: '',
          UptoDate: false,
          Vaccination: ''
        })
      ]),

      TOVITALSIGN: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          DateTime: '',
          MeasuredValue: '',
          NormalRange: '',
          Vdescription: '',
          Vunit: ''
        })
      ]),

      TODIAGNOSIS: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          DCode: '',
          DDescription: '',
          DRemarks: '',
          DAdmission: '',
          DSurgery: '',
          DPreoperative: '',
          DDischarge: ''
        })
      ]),

      TOPASTMEDICAL: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          DiseaseName: '',
          Ddate: '',
          TreatmentDetail: '',
          Remarks: ''
        })
      ]),

      TOPASTSURGICAL: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          SurgeryName: '',
          Sdate: '',
          SurgeryRemarks: ''
        })
      ]),

      TOFAMILYHISTORY: this.formBuilder.array([
        this.formBuilder.group({
          Dockey: '',
          Problem: '',
          Father: '',
          Mother: '',
          Brother: '',
          Sister: '',
          Son: '',
          Paternal: '',
          Maternal: '',
          Remarks: '',
        })
      ]),

      Impression: ''
    });
    this.defaultAddRow();
    this.defaultAddRowforTOINFECTIONS();
    this.defaultAddRowforTOFUNASS();

  }


  // testing logic ------ from down ---------
  getPediatricAdmAssesDocDetails(docKey?) {
    this.subscription = this.emergencyService
      .getPediatricAdmAssesDocDetails(docKey)
      .subscribe({
        next: (data: any) => {
          const result = data?.d?.results?.[0];
          if (!result) return;

          const {
            TOADMMED, TOALLERGY, TOFUNASS, TOINFECTIONS, TOPHYEXAM,
            TOSCALE, TOVACCINATION, TOVITALSIGN, Timee, Datee,
            ...flatFields
          } = result;

          this.toAllergyArr = TOALLERGY.results && TOALLERGY.results.length ? TOALLERGY.results : [];

          this.toScaleArr = TOSCALE.results && TOSCALE.results.length ? TOSCALE.results : [];

          this.toScaleArr.forEach((element) => {
            this.scalesList.forEach((result: any) => {
              if (element.ScaleType == result.ScaleType && element.LastScore) {
                result.Datetimee = element.Datetimee,
                  result.Dockey = element.Dockey,
                  result.description = element.ScoreDesc,
                  result.LastScore = element.LastScore,
                  result.ScaleType = element.ScaleType
              }
            })
          })

          this.toVitalsArr = TOVITALSIGN.results && TOVITALSIGN?.results.length ? TOVITALSIGN.results : [];
          this.toDiagnosisArr = result.TODIAGNOSIS.results;
          this.toPastMedical = result.TOMEDHIST.results.map((el: any) => {
            const timestamp = parseInt(el.Ddate.replace(/[^0-9]/g, ''), 10);
            const jsDate = new Date(timestamp);
            return {
              ...el,
              Ddate: `${this.datePipe.transform(jsDate, 'yyyy-MM-dd')}T00:00:00`
            };
          });
          this.toPastSurgical = result.TOSURGIHIST.results.map((el: any) => {
            const timestamp = parseInt(el.Sdate.replace(/[^0-9]/g, ''), 10);
            const jsDate = new Date(timestamp);
            return {
              ...el,
              Sdate: `${this.datePipe.transform(jsDate, 'yyyy-MM-dd')}T00:00:00`
            };
          });
          this.toFamilyHistory = result.TOFAMILYHIST.results;

          // this.nursingAdmissionForm.patchValue(flatFields);
          this.nursingAdmissionForm.patchValue({
            Dockey: result.Dockey,
            Dtid: result.Dtid,
            Einri: result.Einri,
            Patnr: result.Patnr,
            Falnr: result.Falnr,
            Lfdnr: result.Lfdnr,
            Orgdo: result.Orgdo,
            AttendPhy: result.AttendPhy,
            DocStatus: result.DocStatus,
            AdmittedWard: result.AdmittedWard,
            Room: result.Room,
            From: result.From,
            ReasonVisit: result.ReasonVisit,
            AdmissionMode: result.AdmissionMode,
            AdmissionModeTxt: result.AdmissionModeTxt,
            Accompanied: result.Accompanied,
            AccompaniedTxt: result.AccompaniedTxt,
            InfoObtained: result.InfoObtained,
            InfoObtainedTxt: result.InfoObtainedTxt,
            LanguageSpoken: result.LanguageSpoken,
            SchoolGrade: result.SchoolGrade,
            FavouriteToy: result.FavouriteToy,
            ChiefComplaint: result.ChiefComplaint,
            Substances: result.Substances,
            Vaccinated: result.Vaccinated,

            PsNoProblem: result.PsNoProblem,
            PsAnxious: result.PsAnxious,
            PsUncooperative: result.PsUncooperative,
            PsDepressed: result.PsDepressed,
            PsAngry: result.PsAngry,
            PsAgitated: result.PsAgitated,
            PsCombative: result.PsCombative,
            PsOther: result.PsOther,
            PsComments1: result.PsComments1,

            EcLivingWith: result.EcLivingWith,
            EcNoPeople: result.EcNoPeople,
            EcRelationship: result.EcRelationship,
            EcRelationshipTxt: result.EcRelationshipTxt,
            EcPhone: result.EcPhone,
            EcFatherJob: result.EcFatherJob,
            EcInsurance: result.EcInsurance,

            SNoReportedAbnorm: result.SNoReportedAbnorm,
            SRashes: result.SRashes,
            STypeRash: result.STypeRash,
            SItching: result.SItching,
            SChangeHairNails: result.SChangeHairNails,
            SComments: result.SComments,

            HNoReportedAbnorm: result.HNoReportedAbnorm,
            HHeadInjury: result.HHeadInjury,
            HHeadCircumference: result.HHeadCircumference,
            HComments: result.HComments,

            ENoReportedAbnorm: result.ENoReportedAbnorm,
            EGlassesContacts: result.EGlassesContacts,
            EChangeVision: result.EChangeVision,
            EEyePain: result.EEyePain,
            EDoubleVision: result.EDoubleVision,
            EFlashingLights: result.EFlashingLights,
            EGlaucomaCataracts: result.EGlaucomaCataracts,
            ELastEyeExam: result.ELastEyeExam,
            EComments: result.EComments,

            EneNoReportedAbnorma: result.EneNoReportedAbnorma,
            EneChangeHearing: result.EneChangeHearing,
            EneTympanicMembrane: result.EneTympanicMembrane,
            EneEarDischarge: result.EneEarDischarge,
            EneRinging: result.EneRinging,
            EneDizziness: result.EneDizziness,

            EnnNoReportedAbnorm: result.EnnNoReportedAbnorm,
            EnnNoseBleeds: result.EnnNoseBleeds,
            EnnNasalStuffiness: result.EnnNasalStuffiness,
            EnnFrequentColds: result.EnnFrequentColds,
            EnnNasalFlaring: result.EnnNasalFlaring,

            EnmNoReportedAbnorm: result.EnmNoReportedAbnorm,
            EnmBleedingGums: result.EnmBleedingGums,
            EnmSoreTongue: result.EnmSoreTongue,
            EnmHoarseness: result.EnmHoarseness,
            EnmLipColor: result.EnmLipColor,
            EnmComments: result.EnmComments,

            NNoReportedAbnorm: result.NNoReportedAbnorm,
            NLumps: result.NLumps,
            NSwollenGlands: result.NSwollenGlands,
            NGoiter: result.NGoiter,
            NStiffness: result.NStiffness,
            NComments: result.NComments,

            BNoReportedAbnorm: result.BNoReportedAbnorm,
            BLumps: result.BLumps,
            BPain: result.BPain,
            BNippleDischarge: result.BNippleDischarge,
            BSkinAbnormalities: result.BSkinAbnormalities,
            BComments: result.BComments,

            RNoReportedAbnorm: result.RNoReportedAbnorm,
            RShortnessBreath: result.RShortnessBreath,
            RCough: result.RCough,
            RWheezing: result.RWheezing,
            RCoughingBlood: result.RCoughingBlood,
            RProductionPhlegm: result.RProductionPhlegm,
            RChestPain: result.RChestPain,
            RFever: result.RFever,
            RNightSweats: result.RNightSweats,
            RBlueFingersToes: result.RBlueFingersToes,
            RSwellingHandsFeet: result.RSwellingHandsFeet,
            RBronchitisEmphysema: result.RBronchitisEmphysema,
            RHeartMurmur: result.RHeartMurmur,
            RHxHeartMedication: result.RHxHeartMedication,
            RSkippingHeartBeats: result.RSkippingHeartBeats,
            RComments: result.RComments,

            GNoReportedAbnorm: result.GNoReportedAbnorm,
            GChangeAppetiteWeight: result.GChangeAppetiteWeight,
            GProblemsSwallowing: result.GProblemsSwallowing,
            GNausea: result.GNausea,
            GHeartburn: result.GHeartburn,
            GVomiting: result.GVomiting,
            GVomitingBlood: result.GVomitingBlood,
            GConstipation: result.GConstipation,
            GDiarrhea: result.GDiarrhea,
            GChangeBowelHabits: result.GChangeBowelHabits,
            GAbdominalPain: result.GAbdominalPain,
            GExcessiveBelching: result.GExcessiveBelching,
            GExcessiveFlatus: result.GExcessiveFlatus,
            GYellowColourSkin: result.GYellowColourSkin,
            GFoodIntolerance: result.GFoodIntolerance,
            GRectalBleedingHemo: result.GRectalBleedingHemo,
            GToiletTrained: result.GToiletTrained,
            GTfreq: result.GTfreq,
            GUsesDiaper: result.GUsesDiaper,
            GUfreq: result.GUfreq,
            GComments: result.GComments,

            UNoReportedAbnorm: result.UNoReportedAbnorm,
            UDifficultyUrination: result.UDifficultyUrination,
            UPainBurningUrination: result.UPainBurningUrination,
            UFrequentUrinationNight: result.UFrequentUrinationNight,
            UUrgentNeedUrinate: result.UUrgentNeedUrinate,
            UIncontinenceUrine: result.UIncontinenceUrine,
            UDribbling: result.UDribbling,
            UDecreasedUrineStream: result.UDecreasedUrineStream,
            UBloodUrine: result.UBloodUrine,
            UUtiStonesProstate: result.UUtiStonesProstate,
            UComments: result.UComments,

            PNoReportedAbnorm: result.PNoReportedAbnorm,
            PLegCramps: result.PLegCramps,
            PVaricoseVeins: result.PVaricoseVeins,
            PClotsVeins: result.PClotsVeins,
            PComments: result.PComments,

            MNoReportedAbnorm: result.MNoReportedAbnorm,
            MPain: result.MPain,
            MSwelling: result.MSwelling,
            MStiffness: result.MStiffness,
            MDecreasedJointMotion: result.MDecreasedJointMotion,
            MBrokenBone: result.MBrokenBone,
            MSeriousSprains: result.MSeriousSprains,
            MArthritis: result.MArthritis,
            MGout: result.MGout,
            MComments: result.MComments,

            NuNoReportedAbnorm: result.NuNoReportedAbnorm,
            NuHeadaches: result.NuHeadaches,
            NuSeizures: result.NuSeizures,
            NuLossConsciousness: result.NuLossConsciousness,
            NuParalysis: result.NuParalysis,
            NuWeakness: result.NuWeakness,
            NuLossMuscleSize: result.NuLossMuscleSize,
            NuMuscleSpasm: result.NuMuscleSpasm,
            NuTremor: result.NuTremor,
            NuInvoluntaryMovement: result.NuInvoluntaryMovement,
            NuIncoordination: result.NuIncoordination,
            NuNumbness: result.NuNumbness,
            NuFeelingPinsNeedles: result.NuFeelingPinsNeedles,
            NuComments: result.NuComments,

            HeNoReportedAbnorm: result.HeNoReportedAbnorm,
            HeAnemia: result.HeAnemia,
            HeEasyBruisingBleeding: result.HeEasyBruisingBleeding,
            HeComments: result.HeComments,

            EdNoReportedAbnorm: result.EdNoReportedAbnorm,
            EdAbnormalGrowth: result.EdAbnormalGrowth,
            EdIncreasedAppetite: result.EdIncreasedAppetite,
            EdIncreasedThirst: result.EdIncreasedThirst,
            EdIncreaseUrineProduction: result.EdIncreaseUrineProduction,
            EdThyroidTrouble: result.EdThyroidTrouble,
            EdHeatColdIntolerance: result.EdHeatColdIntolerance,
            EdExcessingSweating: result.EdExcessingSweating,
            EdDiabetes: result.EdDiabetes,
            EdComments: result.EdComments,

            PsNoReportedAbnorm: result.PsNoReportedAbnorm,
            PsTensionAnxiety: result.PsTensionAnxiety,
            PsDepressionSuicide: result.PsDepressionSuicide,
            PsMemoryProblems: result.PsMemoryProblems,
            PsUnusualProblems: result.PsUnusualProblems,
            PsSleepProblems: result.PsSleepProblems,
            PsPastTreatmentPsychiatri: result.PsPastTreatmentPsychiatri,
            PsChangeMood: result.PsChangeMood,
            PsComments: result.PsComments,

            SdNoReported: result.SdNoReported,
            SdInSwollen: result.SdInSwollen,
            SdInVaginal: result.SdInVaginal,
            SdInHypertrophy: result.SdInHypertrophy,
            SdInOther: result.SdInOther,
            SdInOtherTxt: result.SdInOtherTxt,
            SdToEarly: result.SdToEarly,
            SdToOther: result.SdToOther,
            SdToOtherTxt: result.SdToOtherTxt,
            SdPrEarly: result.SdPrEarly,
            SdPrDelayed: result.SdPrDelayed,
            SdPrOther: result.SdPrOther,
            SdPrOtherTxt: result.SdPrOtherTxt,
            SdComments: result.SdComments,

            FaInfantLess: result.FaInfantLess,
            FaRecentChanges: result.FaRecentChanges,
            FaRequiresDr: result.FaRequiresDr,
            FaNotified: result.FaNotified,
            FaComments: result.FaComments,

            SrSleep: result.SrSleep,
            SrSleepTime: result.SrSleepTime,
            SrNumberHours: result.SrNumberHours,
            SrComments: result.SrComments,

            GwMSocialSmile: result.GwMSocialSmile,
            GwMTeething: result.GwMTeething,
            GwMSetAlone: result.GwMSetAlone,
            GwMWalked: result.GwMWalked,
            GwMUsedWords: result.GwMUsedWords,
            GwMUsedSentences: result.GwMUsedSentences,
            GwMToiletTraining: result.GwMToiletTraining,
            GwMPuberity: result.GwMPuberity,
            GwMOther: result.GwMOther,
            GwMOtherTxt: result.GwMOtherTxt,
            GwStatus: result.GwStatus,
            GwComments: result.GwComments,

            SsNoSocial: result.SsNoSocial,
            SsInadequateFamily: result.SsInadequateFamily,
            SsSuspected: result.SsSuspected,
            SsPatient: result.SsPatient,
            SsInadequateFinancial: result.SsInadequateFinancial,
            SsInadequateCoping: result.SsInadequateCoping,
            SsOthers: result.SsOthers,
            SsOthersTxt: result.SsOthersTxt,
            SsSocialWorker: result.SsSocialWorker,

            OpOIdBand: result.OpOIdBand,
            OpOBathroom: result.OpOBathroom,
            OpOBatch: result.OpOBatch,
            OpONurseCall: result.OpONurseCall,
            OpOMealTimes: result.OpOMealTimes,
            OpOVisitingHours: result.OpOVisitingHours,
            OpOTvControl: result.OpOTvControl,
            OpONonSmoking: result.OpONonSmoking,
            OpOPatientEquipment: result.OpOPatientEquipment,
            OpOTelephone: result.OpOTelephone,

            OpPatientHandbook: result.OpPatientHandbook,
            OpPatientHandbookTxt: result.OpPatientHandbookTxt,

            OpVValuables: result.OpVValuables,
            OpVPatent: result.OpVPatent,
            OpVSentHome: result.OpVSentHome,
            OpVSentHomeTxt: result.OpVSentHomeTxt,
            OpVGivenBy: result.OpVGivenBy,
            OpVGivenByTxt: result.OpVGivenByTxt,

            Phy: result.Phy,
            Impression: result.Impression
          });

          this.nursingAdmissionForm.patchValue({ Datee: this.convertDateFormat(Datee) })
          this.nursingAdmissionForm.patchValue({ Timee: this.convertPTTimeToTime(Timee) })
          // Patch the form arrays
          // this.patchFormArray('TOADMMED', TOADMMED, this.createTOADMMEDGroup.bind(this));
          // this.toADMMEDImportedData = TOADMMED.results;
          this.toPHYEXAMmportedData = TOPHYEXAM.results;
          // this.patchFormArray('TOALLERGY', TOALLERGY, this.createTOALLERGYGroup.bind(this));
          // this.patchFormArray('TOFUNASS', TOFUNASS, this.createTOFUNASSGroup.bind(this));
          if (TOFUNASS.results && TOFUNASS?.results?.length) {
            this.patchFormArray('TOFUNASS', TOFUNASS, this.createTOFUNASSGroup.bind(this));
            for (let index = TOFUNASS?.results?.length; index < 3; index++) {
              this.addItemRowForTOFUNASS();
            }
          } else {
            for (let index = 0; index < 2; index++) {
              this.addItemRowForTOFUNASS();
            }
          }

          if (TOINFECTIONS.results && TOINFECTIONS?.results?.length) {
            this.patchFormArray('TOINFECTIONS', TOINFECTIONS, this.createTOINFECTIONSGroup.bind(this));
            for (let index = TOINFECTIONS?.results?.length; index < 3; index++) {
              this.addItemRowforTOINFECTIONS();
            }
          } else {
            for (let index = 0; index < 2; index++) {
              this.addItemRowforTOINFECTIONS();
            }
          }

          if (TOVACCINATION.results && TOVACCINATION?.results?.length) {
            this.patchFormArray('TOVACCINATION', TOVACCINATION, this.createTOVACCINATIONGroup.bind(this));
          } else {
            for (let index = 0; index < 2; index++) {
              this.addItemRow();
            }
          }

          this.patchFormArray('TOVITALSIGN', TOVITALSIGN, this.createTOVITALSIGNGroup.bind(this));

        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
        }
      });
  }

  createTOADMMEDGroup(item): FormGroup {
    return this.formBuilder.group({
      Dockey: item?.Dockey || '',
      EventDesc: item?.EventDesc || '',
      Dose: item?.Dose || ''
    });
  }

  createTOALLERGYGroup(item): FormGroup {
    return this.formBuilder.group({
      Agroup: item?.Agroup || '',
      Description: item?.Description || '',
      Dockey: item?.Dockey || ''
    });
  }

  createTOFUNASSGroup(item?): FormGroup {
    return this.formBuilder.group({
      Dockey: item?.Dockey || '',
      Describe: item?.Describe || '',
      Functions: item?.Functions || '',
      Score: item?.Score || ''
    });
  }

  createTOINFECTIONSGroup(item): FormGroup {
    return this.formBuilder.group({
      Dockey: item?.Dockey || '',
      InfectiousDiesease: item?.InfectiousDiesease || '',
      Status: item?.Status || '',
      TypeIsolation: item?.TypeIsolation || ''
    });
  }

  createTOPHYEXAMGroup(item): FormGroup {
    return this.formBuilder.group({
      Dockey: item?.Dockey || '',
      PhyComments: item?.PhyComments || '',
      PhyDate: this.convertDateFormat(item?.PhyDate) || '',
      PhyTime: this.convertTimeFormat(item?.PhyTime) || '',
      PhyDescription: item?.PhyDescription || '',
      PhyMode: item?.PhyMode || ''
    });
  }

  createTOSCALEGroup(item): FormGroup {
    return this.formBuilder.group({
      Dockey: item?.Dockey || '',
      Datetimee: item?.Datetimee || '',
      LastScore: item?.LastScore || '',
      ScaleType: item?.ScaleType || '',
      ScoreDesc: item?.ScoreDesc || ''
    });
  }

  createTOVACCINATIONGroup(item): FormGroup {
    return this.formBuilder.group({
      Dockey: item?.Dockey || '',
      Other: item?.Other || '',
      Status: item?.Status || '',
      UptoDate: item?.UptoDate || false,
      Vaccination: item?.Vaccination || ''
    });
  }

  createTOVITALSIGNGroup(item): FormGroup {
    return this.formBuilder.group({
      Dockey: item?.Dockey || '',
      DateTime: item?.DateTime || '',
      MeasuredValue: item?.MeasuredValue || '',
      NormalRange: item?.NormalRange || '',
      Vdescription: item?.Vdescription || '',
      Vunit: item?.Vunit || ''
    });
  }

  // createTODIAGNOSESGroup(item): FormGroup {
  //   return this.formBuilder.group({
  //     Dockey: item?.Dockey || '',
  //     DCode: item?.DCode || '',
  //     DDescription: item?.DDescription || '',
  //     DRemarks: item?.DRemarks || '',
  //     DAdmission: item?.DAdmission || '',
  //     DSurgery: item?.DSurgery || '',
  //     DPreoperative: item?.DPreoperative || '',
  //     DDischarge: item?.DDischarge || ''
  //   });
  // }

  patchFormArray(key: string, data: any, createGroupFn: (item: any) => FormGroup) {
    const formArray = this.nursingAdmissionForm.get(key) as FormArray;
    formArray.clear();

    const results = Array.isArray(data?.results) ? data.results : [];

    results.forEach(item => {
      formArray.push(createGroupFn(item));
    });
  }


  // testing logic ------ to top ---------


  CreatePediatricAdmAssesDoc(status): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload = {
        d: this.nursingAdmissionForm.value
      };
      payload.d.Orgdo = this.storageService.patientData.deptOrgUnit;
      payload.d.AttendPhy = this.storageService.getUserProfile().Gpart;

      payload.d.DocStatus = status;
      payload.d.Datee = payload.d.Datee ? this.convertDateFormat(payload.d.Datee) : null;
      payload.d.Timee = payload.d.Timee ? this.convertTimeFormat(payload.d.Timee) : null;
      payload.d.SrSleepTime = ''; // this si temparary madded as free text fiels because backend side change is pending

      if (this.actionTypeData.type === ActionType.Update$) {
        payload.d.Dockey = this.actionTypeData.value.docKey;
      }
      if (this.admissionService.isClonePaediatricsAdmissionForm) {
        payload.d.Dockey = this.admissionService.selectedCurrentDocDetails.Dockey
      }

      payload.d.TOALLERGY = this.toAllergyArr && this.toAllergyArr?.length ? this.toAllergyArr : [];
      payload.d.TOALLERGY.forEach(item => {
        item.Dockey = this.docKey;
      });

      payload.d.TOVITALSIGN = this.toVitalsArr && this.toVitalsArr?.length ? this.toVitalsArr : [];
      if (payload.d.TOVITALSIGN.length) {
        payload.d.TOVITALSIGN.forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      payload.d.TOVACCINATION = payload.d.TOVACCINATION.filter(item => item.Other?.trim() !== '' || item.Status?.trim() !== '' || item.Vaccination?.trim() !== '');
      if (payload.d.TOVACCINATION.length) {
        payload.d.TOVACCINATION.forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      payload.d.TOINFECTIONS = payload.d.TOINFECTIONS.filter(item => item.InfectiousDiesease?.trim() !== '' || item.Status?.trim() !== '' || item.TypeIsolation?.trim() !== '');
      if (payload.d.TOINFECTIONS.length) {
        payload.d.TOINFECTIONS.forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      let checkScalesList: any[] = this.scalesList.filter((result) => {
        delete result.description;
        delete result.value;
        result.LastScore = result?.LastScore?.toString()
        if (result.LastScore) return result;
      });

      payload.d.TOSCALE = checkScalesList;
      if (payload.d.TOSCALE.length) {
        payload.d.TOSCALE.forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      // payload.d.TOADMMED = this.toADMMEDImportedData && this.toADMMEDImportedData?.length ? this.toADMMEDImportedData : [];
      if (payload.d.TOADMMED.length) {
        let convertedArray: any[] = payload.d.TOADMMED.map(item => ({
          Dockey: item.Dockey,
          EventDesc: item.EventDesc,
          Dose: item.Dose
        }));
        payload.d.TOADMMED = convertedArray;
      }



      payload.d.TOPHYEXAM = this.toPHYEXAMmportedData && this.toPHYEXAMmportedData.length ? this.toPHYEXAMmportedData : [];
      if (payload.d.TOPHYEXAM) {
        payload.d.TOPHYEXAM.forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      delete payload.d.TODIAGNOSES;
      delete payload.d.TOFAMILYHISTORY;
      delete payload.d.TOPASTMEDICAL;
      delete payload.d.TOPASTSURGICAL;
      payload.d['TOMEDHIST'] = this.toPastMedical;
      payload.d['TOSURGIHIST'] = this.toPastSurgical;
      payload.d['TOFAMILYHIST'] = this.toFamilyHistory;
      // payload.d['TOMEDICATION'] = this.medicationImportDrugArray;
      payload.d.TODIAGNOSIS = this.toDiagnosisArr && this.toDiagnosisArr.length ? this.toDiagnosisArr : [];
      if (payload.d.TODIAGNOSIS) {
        payload.d.TODIAGNOSIS.forEach(item => {
          item.Dockey = this.docKey;
        });
      }


      payload.d.TOFUNASS = []
      // if (payload.d.TOFUNASS.length) {
      //   payload.d.TOFUNASS.forEach(item => {
      //     item.Dockey = this.docKey;
      //   });
      // }



      //Setting DocKey blank on create new version & release
      // if (status === '5') {
      //   payload.d.Dockey = '';
      // }
      payload.d.Phy = 'X';
      this.subscription = this.emergencyService.CreatePediatricAdmAssesDoc(payload).subscribe({
        next: (data: any) => {
          this.admissionService.cancelAllForm();
          this.admissionService.selectedCurrentDocDetails = '';
          this.admissionService.clearSoapEvent.next(true);
          this.realodEducationList.next(true);
          // Handle successful data retrieva
          // resolve(formValue); // Resolve the promise with formValue
        },
        error: (err: any) => {
          // Handle errors if the request fails
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`POST Error at Pediatrics Admission Assessment : ${err}`);
        },
        complete: () => {
          this.admissionService.cancelAllForm();
          this.admissionService.selectedCurrentDocDetails = '';
          this.admissionService.clearSoapEvent.next(true);
          this.realodEducationList.next(true);
          // Handle completion (optional), invoked when the observable completes
          resolve(true); // Resolve the promise with formValue
          if (status === '1') {
            this.sharedService.successSwallModel('Pediatrics Admission Assessment created successfully');
          } else if (status === '5') {
            this.sharedService.successSwallModel('Pediatrics Admission Assessment New version Created & Released successfully');
          } else if (status === '1') {
            this.sharedService.successSwallModel('Pediatrics Admission Assessment Released successfully');
          }
        }
      });
    });
  }
  toPHYEXAMmportedData: any

  physicianExamaminationArrayListData($event) {
    this.toPHYEXAMmportedData = $event
  }

  private convertDateFormat(dateInput) {

    // If input is a Date object, convert to /Date(timestamp)/
    if (dateInput instanceof Date) {
      return `/Date(${dateInput.getTime()})/`;
    }

    // If input is an ISO date string (e.g. "2025-06-30T05:07:07.976Z")
    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return `/Date(${date.getTime()})/`;
      }
    }

    // If input is in /Date(timestamp)/ format
    const match = /\/Date\((\d+)\)\//.exec(dateInput);
    if (match) {
      const timestamp = parseInt(match[1], 10);
      return new Date(timestamp);
    }
    return null;

  }


  private convertTimeFormat(timeInput) {

    // If format is HH:mm
    if (typeof timeInput === 'string' && /^\d{1,2}:\d{2}$/.test(timeInput)) {
      const [hours, minutes] = timeInput.split(':').map(Number);
      return `PT${hours}H${minutes}M0S`;
    }

    if (typeof timeInput === 'string') {
      const [hours, minutes, seconds] = timeInput.split(":").map(Number);
      return `PT${hours}H${minutes}M${seconds}S`;
    }

    // If format is ISO 8601 duration (e.g. PT15H51M25S)
    const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(timeInput);
    if (match) {
      const hours = match[1] ? parseInt(match[1], 10) : 0;
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      // You can choose to include or ignore seconds
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return null;
  }

  convertPTTimeToTime(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (match) {
      const hours = match[1] ? match[1].padStart(2, '0') : "00";
      const minutes = match[2] ? match[2].padStart(2, '0') : "00";
      const seconds = match[3] ? match[3].padStart(2, '0') : "00";

      return `${hours}:${minutes}:${seconds}`;
    }
  }

  // this function is updatted one dont not remove it
  addItemRowforTOINFECTIONS() {
    const control = this.nursingAdmissionForm.get('TOINFECTIONS') as FormArray;
    control.push(this.itemFormArrayFieldForInfectious());
  }

  // this function is updatted one dont not remove it
  itemFormArrayFieldForInfectious(): FormGroup {
    return this.formBuilder.group({
      Dockey: '',
      InfectiousDiesease: '',
      Status: '',
      TypeIsolation: ''
    })
  }

  // this function is updatted one dont not remove it
  defaultAddRow() {
    for (let index = 0; index < 3; index++) {
      this.addItemRow();
    }
  }
  // this function is updatted one dont not remove it
  defaultAddRowforTOINFECTIONS() {
    for (let index = 0; index < 2; index++) {
      this.addItemRowforTOINFECTIONS();
    }
  }

  // this function is updatted one dont not remove it
  addItemRow() {
    const control = this.nursingAdmissionForm.get('TOVACCINATION') as FormArray;
    control.push(this.itemFormArrayFieldForTOVACCINATION());
  }

  // this function is updatted one dont not remove it
  itemFormArrayFieldForTOVACCINATION(): FormGroup {
    return this.formBuilder.group({
      Dockey: '',
      Other: '',
      Status: '',
      UptoDate: false,
      Vaccination: ''
    })
  }
  // this function is updatted one dont not remove it
  addTableRow(event: any) {
    if (event == 'Vaccination History') {
      this.addItemRow();
    } else {
      this.defaultAddRowforTOINFECTIONS()
    }
  }

  defaultAddRowforTOFUNASS() {
    for (let index = 0; index < 2; index++) {
      this.addItemRowForTOFUNASS();
    }
  }
  addItemRowForTOFUNASS() {
    const control = this.nursingAdmissionForm.get('TOFUNASS') as FormArray;
    control.push(this.createTOFUNASSGroup());
  }

  public importAllergyData(data) {
    data.forEach((el) => {
      this.toAllergyArr = this.toAllergyArr.concat({
        Dockey: '',
        Agroup: el.AllergenGrp,
        Description: el.Allergen,
      });
    });
    if (this.toAllergyArr.length) {
      this.allergyInformation = 'Allergy Exists';
    } else {
      this.allergyInformation = 'No know allergies';
    }
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

  public openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
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


  public deleteFromAllergy(item, index) {
    this.toAllergyArr.splice(index, 1);
    if (this.toAllergyArr.length) {
      this.allergyInformation = 'Allergy Exists';
    } else {
      this.allergyInformation = 'No know allergies';
    }
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
      customClass: 'myalertpopup',
    }).then((result) => {
      if (result.isConfirmed) {
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

  isDockeyAvailable(): boolean {
    return this.scalesList.some(scale => scale.Dockey && scale.Dockey.trim() !== '');
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
        if (resp.body?.d?.results.length) {
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
      this.scalesList.forEach((result: any) => {
        if (element.Scaletype == result.ScaleType && element.Score) {
          result.Datetimee = element.DateTime,
            result.Dockey = element.Dockey,
            result.ScoreDesc = element.ScoreDesc,
            result.LastScore = element.Score,
            result.ScaleType = element.Scaletype
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

  public viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.value == '1') {
      if (item.Dockey) {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    }
  }

  removeScale(index: number) {
    this.scalesList[index].LastScore = "";
    this.scalesList[index].ScoreDesc = "";
    this.scalesList[index].Dockey = "";
    this.scalesList[index].Datetimee = "";
  }

  get items(): FormArray {
    return this.nursingAdmissionForm.get('TOINFECTION') as FormArray;
  }


  public scaleStoreInTable(event: any, scaleType: string) {
    if (scaleType == 'morseFall') {
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

  public handleCheckboxVitals(event) {
    this.isChecked = event.target.checked;
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

  public handleCheckboxDiagnosis(event) {
    this.isCheckedNoDiagnosis = event.target.checked;
  }

  openModalForDiagnosis() {
    if (this.isCheckedNoDiagnosis) return;
    this.diagnosisNotesKardex.openModalForDiagnosisKardex();
  }

  // past medical
  openModalForPastMedical() {
    this.pastMedicalKardex.openModalForPastMedical();
  }
  // past surgical
  openModalForPastSurgical() {
    this.pastSurgicalKardex.openModalForPastSurgical();
  }
  // family history
  openModalForFamilyHistory() {
    this.familyHistoryKardex.openModalForFamilyHistory();
  }

  public deleteVitalsFromTable(index: number) {
    if (index > -1) {
      this.toVitalsArr.splice(index, 1);
    }
  }

  handleCheckboxPastMed() {
    if (this.nursingAdmissionForm.controls.NoMedicalHistory.value) {
      this.enableCreatePMed = true;
    } else {
      this.enableCreatePMed = false;
    }
  }

  deleteFromPastMedicalTable(item, index) {
    this.toPastMedical.splice(index, 1);
  }
  deleteFromPastSurgTable(item, index) {
    this.toPastSurgical.splice(index, 1);
  }
  deleteFamilyHistoryFromTable(index) {
    this.toFamilyHistory.splice(index, 1);
  }

  handleCheckboxPastSurg() {
    if (this.nursingAdmissionForm?.controls?.NoSurgeryHistory?.value) {
      this.enableCreatePSurg = true;
    } else {
      this.enableCreatePSurg = false;
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

  deleteDiagnosisFromTable(item, index) {
    this.toDiagnosisArr.splice(index, 1);
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


  //this below is for diagnosis handling
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
  switchTabsForMedical(tab) {
    this.selectedTabName = tab;
    if (tab == 'med') {
      this.med = true;
      this.surg = false;
      this.family = false;
    } else if (tab == 'surg') {
      this.med = false;
      this.surg = true;
      this.family = false;
    } else if (tab == 'family') {
      this.med = false;
      this.surg = false;
      this.family = true;
    }
  }




  //this below is for past medical tab handling

  importPastMedical(data) {
    data.forEach((el) => {
      this.toPastMedical = this.toPastMedical.concat({
        DiseaseName: el.Disease,
        Ddate: `${new DatePipe('en-US').transform(
          el.FromDate,
          'yyyy-MM-dd'
        )}T00:00:00`,
        // Mode: el.Mode,
        Dremarks: el.Remarks,
        // ToDate: el.ToDate,
        TreatmentDetail: el.Treatment,
        // isChecked: el.isChecked,
        // isNew: el.isNew,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesPastMedical();
    this.toPastMedical = this.toPastMedical.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.DiseaseName === value.DiseaseName)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesPastMedical();
    }
  }

  findDuplicatesPastMedical() {
    let tempArr = [];
    const lookup = this.toPastMedical.reduce((a, e) => {
      a[e.DiseaseName] = ++a[e.DiseaseName] || 0;
      return a;
    }, {});
    tempArr = this.toPastMedical.filter((e) => lookup[e.DiseaseName]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.DiseaseName === value.DiseaseName)
    );
  }

  errorMsgForDuplicatesPastMedical() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.DiseaseName);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup',
    });
  }


  //this below is for past surgical tab handling
  importPastSurgical(data) {
    data.forEach((el) => {
      this.toPastSurgical = this.toPastSurgical.concat({
        SurgeryName: el.Surgeryname,
        Sdate: `${new DatePipe('en-US').transform(
          el.Date,
          'yyyy-MM-dd'
        )}T00:00:00`,
        SurgeryRemarks: el.Remarks,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesPastSurgical();
    this.toPastSurgical = this.toPastSurgical.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.SurgeryName === value.SurgeryName)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesPastSurgical();
    }
  }

  findDuplicatesPastSurgical() {
    let tempArr = [];
    const lookup = this.toPastSurgical.reduce((a, e) => {
      a[e.SurgeryName] = ++a[e.SurgeryName] || 0;
      return a;
    }, {});
    tempArr = this.toPastSurgical.filter((e) => lookup[e.SurgeryName]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.SurgeryName === value.SurgeryName)
    );
  }

  errorMsgForDuplicatesPastSurgical() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.SurgeryName);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup',
    });
  }



  //this below is for medical histiry tab handling


  importMedicalHistory(data) {
    data.forEach((el) => {
      this.toFamilyHistory = this.toFamilyHistory.concat(el);
    });
  }














}
