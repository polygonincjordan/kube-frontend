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
  public nursingAdmissionForm: FormGroup;
  @Input() soapFormEvent: string;
  @Output() reloadTableList = new EventEmitter();
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
  enableCreatePMed: boolean=false;
  enableCreatePSurg: boolean=false;
  enableCreateFamily: boolean=false;
  public toVitalsArr: any = [];
  private actionTypeData!: any; // working on here
  toDiagnosisArr: any = [];
  toPastMedical: any = [];
  toPastSurgical: any = [];
  toFamilyHistory: any = [];
  med: boolean = true;
  surg: boolean = false;
  family: boolean = false;

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
          this.CreatePediatricAdmAssesDoc('4')
        } else {
          this.CreatePediatricAdmAssesDoc('2')
        }
      }
    }

    if (this.admissionService.isEditPaediatricsAdmissionForm || this.admissionService.isClonePaediatricsAdmissionForm) {
      this.getPediatricAdmAssesDocDetails(this.admissionService.selectedCurrentDocDetails.Dockey);
    }
  }

  initForm() {

    const check = this.storageService.getGpart()

    this.nursingAdmissionForm = this.formBuilder.group({

      Dtid: 'ZMED_PDASM',
      Dockey: '',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      AttendPhy: this.storageService.getGpart(),
      DocStatus: '1',
      Vaccinated: '',
      Accompanied: '',
      AccompaniedTxt: '',
      AdmissionMode: '',
      AdmissionModeTxt: '',
      ChiefComplaint: ['', Validators.required],
      Datee: [new Date()],
      FavouriteToy: '',
      InfoObtained: '',
      InfoObtainedTxt: '',
      LanguageSpoken: '',
      ReasonVisit: '',
      EcFatherJob: '',
      EcInsurance: '',
      EcNoPeople: '',
      EcPhone: '',
      EcRelationship :'',
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
    EneRinging: false ,
    EnnNoReportedAbnorm: false,
    EnnNoseBleeds: false,
    EnnNasalStuffiness: false,
    EnnNasalFlaring: false,
    EnnFrequentColds: false,
    NNoReportedAbnorm: false,
    EnmSoreTongue: false,
    EnmLipColor: '',
    GNoReportedAbnorm:false,
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
    GExcessiveFlatus:false,
    GYellowColourSkin: false,
    GFoodIntolerance: false,
    GRectalBleedingHemo: false,
    GToiletTrained: false,
    GTfreq: '',
    GUsesDiaper: false,
    GUfreq: '',
    UNoReportedAbnorm: false,
    UDifficultyUrination:false,
    UPainBurningUrination: false,
    UFrequentUrinationNight: false,
    UUrgentNeedUrinate: false,
    UIncontinenceUrine: false,
    UDecreasedUrineStream:false,
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
    Timee: '',
    NoSurgeryHistory: false,
    NoMedicalHistory: false,



    AdmittedWard: '', // AdmittedWard (not binded) >>> ? keep it unbind
    Room: '',  // Room (not binded) >>> ? keep it unbind
    From:'', // Not binded (keep it unbind)
    HComments: '', // not clear (from new payload)  if not found witha anyone then bind this -> HComments -> Physical Assessment (Review of Systems) -> Head
    EnmComments: '', // not clear (not sure wich key is)
    RFever: false, // not clear (not sure wich key is)
    EnmHoarseness: false, // not clear (not sure wich key is)
    FaComments: '', // not clear (not sure wich key is)



    //Newly Added formcontrol not sure (random name of formControls)
    IPcare:'',





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

TODIAGNOSES: this.formBuilder.array([
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


    });
    this.defaultAddRow();
    this.defaultAddRowforTOINFECTIONS();

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
            TOSCALE, TOVACCINATION, TOVITALSIGN, TODIAGNOSES, TOPASTMEDICAL, TOFAMILYHISTORY,  TOPASTSURGICAL,  Timee, Datee,
            ...flatFields
          } = result;


        this.toDiagnosisArr = TODIAGNOSES.value.map(diagnosis => ({
          Dockey: diagnosis.Dockey,
          DCode: diagnosis.DCode,
          DDescription: diagnosis.DDescription,
          DRemarks: diagnosis.DRemarks,
          DAdmission: diagnosis.DAdmission,
          DSurgery: diagnosis.DSurgery,
          DPreoperative: diagnosis.DPreoperative,
          DDischarge: diagnosis.DDischarge
        }));

        this.toPastMedical = TOPASTMEDICAL.value.map(medicItem => ({
          Dockey: medicItem.Dockey,
          DiseaseName: medicItem.DiseaseName,
          DDescription: medicItem.DDescription,
          Ddate: medicItem.Ddate,
          Remarks: medicItem.Remarks,
        }));

        this.toPastSurgical = TOPASTSURGICAL.value.map(item => ({
          Dockey: item.Dockey,
          SurgeryName: item.SurgeryName,
          Sdate: item.Sdate,
          SurgeryRemarks: item.Ddate,
        }));

        this.toFamilyHistory = TOFAMILYHISTORY.value.map(item => ({
          Dockey: item.Dockey,
          SurgeryName: item.SurgeryName,
          Sdate: item.Sdate,
          SurgeryRemarks: item.Ddate,
        }));


          this.nursingAdmissionForm.patchValue(flatFields);
          this.nursingAdmissionForm.patchValue({Datee : this.convertDateFormat(Datee)})
          this.nursingAdmissionForm.patchValue({ Timee: this.convertTimeFormat(Timee) })
          this.nursingAdmissionForm.patchValue({ Datee: this.convertDateFormat(Datee) })


          // Patch the form arrays
          this.patchFormArray('TOADMMED', TOADMMED, this.createTOADMMEDGroup.bind(this));
          this.patchFormArray('TOALLERGY', TOALLERGY, this.createTOALLERGYGroup.bind(this));
          this.patchFormArray('TOFUNASS', TOFUNASS, this.createTOFUNASSGroup.bind(this));
          this.patchFormArray('TOINFECTIONS', TOINFECTIONS, this.createTOINFECTIONSGroup.bind(this));
          this.patchFormArray('TOPHYEXAM', TOPHYEXAM, this.createTOPHYEXAMGroup.bind(this));
          this.patchFormArray('TOSCALE', TOSCALE, this.createTOSCALEGroup.bind(this));
          this.patchFormArray('TOVACCINATION', TOVACCINATION, this.createTOVACCINATIONGroup.bind(this));
          this.patchFormArray('TOVITALSIGN', TOVITALSIGN, this.createTOVITALSIGNGroup.bind(this));
          // this.patchFormArray('TODIAGNOSES', TODIAGNOSES, this.createTODIAGNOSESGroup.bind(this));


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

createTOFUNASSGroup(item): FormGroup {
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

      // here need to make the final pylaod

      let payload = {
        d: this.nursingAdmissionForm.value
      };

      payload.d.DocStatus = status;
      payload.d.Datee = this.convertDateFormat(payload.d.Datee);
      payload.d.Timee = this.convertTimeFormat(payload.d.Timee);
      payload.d.SrSleepTime = ''; // this si temparary madded as free text fiels because backend side change is pending

      if( this.actionTypeData.type === ActionType.Update$){
        payload.d.Dockey = this.actionTypeData.value.docKey;
      }

       payload.d.TOADMMED.forEach(item => {
        item.Dockey = this.docKey;
      });

      payload.d.TOALLERGY.forEach(item => {
        item.Dockey = this.docKey;
      });

      payload.d.TOFUNASS.forEach(item => {
        item.Dockey = this.docKey;
      });

      payload.d.TOINFECTIONS.forEach(item => {
        item.Dockey = this.docKey;
      });

      payload.d.TOPHYEXAM.forEach(item => {
        item.PhyDate = this.convertDateFormat(item.PhyDate);
        item.PhyTime = this.convertTimeFormat(item.PhyTime);
        item.Dockey = this.docKey;
      });

      payload.d.TOPASTMEDICAL.forEach(item => {
        item.Ddate = this.convertDateFormat(item.Ddate);
        item.Dockey = this.docKey;
      });

      payload.d.TOPASTSURGICAL.forEach(item => {
        item.Sdate = this.convertDateFormat(item.Sdate);
        item.Dockey = this.docKey;
      });

      payload.d.TOSCALE.forEach(item => {
        item.Dockey = this.docKey;
      });

      payload.d.TOVACCINATION.forEach(item => {
        item.Dockey = this.docKey;
      });

      payload.d.TOVITALSIGN.forEach(item => {
        item.Dockey = this.docKey;
        item.DateTime = this.convertTimeFormat(item.DateTime);
      });


      payload.d.TODIAGNOSES = this.toDiagnosisArr;
      payload.d.TOPASTMEDICAL= this.toPastMedical;
      payload.d.TOPASTSURGICAL= this.toPastSurgical;
      payload.d.TOFAMILYHISTORY= this.toFamilyHistory;

      //Setting DocKey blank on create new version & release
      if(status === '5'){
        payload.d.Dockey = '';
      }

      this.subscription = this.emergencyService.CreatePediatricAdmAssesDoc(payload).subscribe({
        next: (data: any) => {
          // Handle successful data retrieva
          // resolve(formValue); // Resolve the promise with formValue
        },
        error: (err: any) => {
          // Handle errors if the request fails
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`POST Error at Pediatrics Admission Assessment : ${err}`);
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          resolve(true); // Resolve the promise with formValue
          if(status === '1') {
            this.sharedService.successSwallModel('Pediatrics Admission Assessment created successfully');
          } else if (status === '5') {
            this.sharedService.successSwallModel('Pediatrics Admission Assessment New version Created & Released successfully');
          }else if (status === '1'){
            this.sharedService.successSwallModel('Pediatrics Admission Assessment Released successfully');
          }
        }
      });
    });
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









// this function is updatted one dont not remove it
  addItemRowforTOINFECTIONS() {
    const control  = this.nursingAdmissionForm.get('TOINFECTIONS') as FormArray;
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
    return    this.formBuilder.group({
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
    if(this.isCheckedNoDiagnosis) return;
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

   handleCheckboxPastMed(){
    if (this.nursingAdmissionForm.controls.NoMedicalHistory.value) {
      this.enableCreatePMed = true;
    }else{
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

    handleCheckboxPastSurg(){
    if (this.nursingAdmissionForm.controls.NoSurgeryHistory.value) {
      this.enableCreatePSurg = true;
    }else{
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
