import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-paediatrics-adm-document',
  templateUrl: './paediatrics-adm-document.component.html',
  styleUrls: ['./paediatrics-adm-document.component.scss']
})
export class PaediatricsAdmDocumentComponent implements OnInit {
  public nursingAdmissionForm: FormGroup;


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
      // this.getPatinetDetails(this.encounterId);
    });
    this.initForm();

    // this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
    //   (data) => {
    //     if (data != null) {
    //       if (data.type == ActionType.Add$ && data.value == '') {
    //         this.docKey = data.value.Dockey;
    //       }
    //       if (data.type == ActionType.Update$ && data.value) {
    //         this.docKey = data.value.docKey;
    //         this.getNursingAdmissionDocDetails(data.value.docKey);
    //       }
    //       if (data.type == ActionType.Copy$ && data.value) {
    //         this.docKey = data.value.docKey;
    //         this.getNursingAdmissionDocDetails(data.value.docKey);
    //       }
    //     }
    //   }
    // );
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
  

    }

}
