import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
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

  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScalePopupComponent;
  @ViewChild('morseFallScale') morseFallScale: MorseFallScaleComponent;
  @ViewChild('bradenScaleTemp') bradenScaleTemp: BradenScaleComponent;
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
  toADMMED
  toADMMEDImportedData: any
  toPHYEXAMmportedData: any
  modalRefScales: BsModalRef;
  isChecked: any;
  public toVitalsArr: any = [];
  private actionTypeData!: any
  physicianForm: FormGroup;

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
    // if (changes.soapFormEvent.currentValue == 'add') {
    //   if (this.admissionService.isCloneNeonatalDischarge) {
    //     this.createNeonatalDischargeDocument('3')
    //   }
    //   else {
    //     this.createNeonatalDischargeDocument('1')
    //   }
    // }
    // if (changes.soapFormEvent.currentValue == 'edit') {
    //   this.createNeonatalDischargeDocument('1')
    // }

    // if (changes.soapFormEvent.currentValue == 'release') {
    //   if (this.admissionService.isCloneNeonatalDischarge) {
    //     this.createNeonatalDischargeDocument('5')
    //   } else {
    //     if (this.admissionService.isEditNeonatalDischarge) {
    //       this.createNeonatalDischargeDocument('2')
    //     } else {
    //       this.createNeonatalDischargeDocument('4')
    //     }
    //   }
    // }

    // if (this.admissionService.isEditNeonatalDischarge || this.admissionService.isCloneNeonatalDischarge) {
    //   this.getNeonatalDischargeDocDetails(this.admissionService.selectedCurrentDocDetails.Dockey);
    // }
  }

  initForm() {
    // let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss a');
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
      ChiefComplaint: ['chief complaint is:'],
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

      //this PHYEXAM and all it's function is mendator
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


    });
    // this.initPhyExamForm();
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
            TOSCALE, TOVACCINATION, TOVITALSIGN, Timee, Datee,
            ...flatFields
          } = result;

          this.toAllergyArr = TOALLERGY.results && TOALLERGY.results.length ? TOALLERGY.results : [];

          this.toScaleArr = TOSCALE.results && TOSCALE.results.length ? TOSCALE.results : [];

          this.toScaleArr.forEach((element) => {
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

          this.toVitalsArr = TOVITALSIGN.results && TOVITALSIGN?.results.length ? TOVITALSIGN.results : [];


          this.nursingAdmissionForm.patchValue(flatFields);
          this.nursingAdmissionForm.patchValue({ Datee: this.convertDateFormat(Datee) })
          this.nursingAdmissionForm.patchValue({ Timee: this.convertTimeFormat(Timee) })

          // Patch the form arrays
          // this.patchFormArray('TOADMMED', TOADMMED, this.createTOADMMEDGroup.bind(this));
          this.toADMMEDImportedData = TOADMMED.results;
          this.toPHYEXAMmportedData = TOPHYEXAM.results;
          // this.patchFormArray('TOALLERGY', TOALLERGY, this.createTOALLERGYGroup.bind(this));
          // this.patchFormArray('TOINFECTIONS', TOINFECTIONS, this.createTOINFECTIONSGroup.bind(this));
          // this.patchFormArray('TOPHYEXAM', TOPHYEXAM, this.createTOPHYEXAMGroup.bind(this));
          // this.patchFormArray('TOSCALE', TOSCALE, this.createTOSCALEGroup.bind(this));

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
            for (let index = TOVACCINATION?.results?.length; index < 3; index++) {
              this.addItemRow();
            }
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

  createTOALLERGYGroup(item?): FormGroup {
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

  createTOPHYEXAMGroup(item?): FormGroup {
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

  patchFormArray(key: string, data: any, createGroupFn: (item: any) => FormGroup) {
    const formArray = this.nursingAdmissionForm.get(key) as FormArray;
    formArray.clear();
    console.log(data, "------")

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
      payload.d.Orgdo = this.storageService.patientData.deptOrgUnit;
      payload.d.AttendPhy = this.storageService.getUserProfile().Gpart;
      payload.d.Datee = this.convertDateFormat(payload.d.Datee);
      payload.d.Timee = this.convertTimeFormat(payload.d.Timee);
      payload.d.SrSleepTime = ''; // this si temparary madded as free text fiels because backend side change is pending

      if (this.actionTypeData.type === ActionType.Update$) {
        payload.d.Dockey = this.actionTypeData.value.docKey;
      }

      payload.d.TOALLERGY = this.toAllergyArr && this.toAllergyArr?.length ? this.toAllergyArr : [];
      payload.d.TOALLERGY.forEach(item => {
        item.Dockey = this.docKey;
      });

      let checkScalesList: any[] = this.scalesList.filter((res) => {
        delete res.description;
        delete res.value;
        res.LastScore = res?.LastScore?.toString()
        if (res.LastScore) return res;
      });

      payload.d.TOSCALE = checkScalesList;
      if (payload.d.TOSCALE.length) {
        payload.d.TOSCALE.forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      payload.d.TOADMMED = this.toADMMEDImportedData && this.toADMMEDImportedData?.length ? this.toADMMEDImportedData : [];
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


      payload.d.TOFUNASS = payload.d.TOFUNASS.filter(item => item.Describe?.trim() !== '' || item.Functions?.trim() !== '');
      if (payload.d.TOFUNASS.length) {
        payload.d.TOFUNASS.forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      payload.d.TOINFECTIONS = payload.d.TOINFECTIONS.filter(item => item.InfectiousDiesease?.trim() !== '' || item.Status?.trim() !== '' || item.TypeIsolation?.trim() !== '');
      if (payload.d.TOINFECTIONS.length) {
        payload.d.TOINFECTIONS.forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      payload.d.TOVACCINATION = payload.d.TOVACCINATION.filter(item => item.Other?.trim() !== '' || item.Status?.trim() !== '' || item.Vaccination?.trim() !== '');
      if (payload.d.TOVACCINATION.length) {
        payload.d.TOVACCINATION.forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      payload.d.TOVITALSIGN = this.toVitalsArr && this.toVitalsArr?.length ? this.toVitalsArr : [];
      if (payload.d.TOVITALSIGN.length) {
        payload.d.TOVITALSIGN.forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      //Setting DocKey blank on create new version & release
      if (status === '5') {
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


  // this function is updatted one dont not remove it (this is in use during form creation)
  defaultAddRow() {
    for (let index = 0; index < 3; index++) {
      this.addItemRow();
    }
  }
  // this function is updatted one dont not remove it (this is in use during form creation)
  defaultAddRowforTOINFECTIONS() {
    for (let index = 0; index < 2; index++) {
      this.addItemRowforTOINFECTIONS();
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
  addItemRow() {
    const control = this.nursingAdmissionForm.get('TOVACCINATION') as FormArray;
    control.push(this.itemFormArrayFieldForTOVACCINATION());
  }

  addItemRowForTOPHYEXAM() {
    const control = this.nursingAdmissionForm.get('TOPHYEXAM') as FormArray;
    control.push(this.createTOPHYEXAMGroup());
  }

  addItemRowForTOFUNASS() {
    const control = this.nursingAdmissionForm.get('TOFUNASS') as FormArray;
    control.push(this.createTOFUNASSGroup());
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


  addTableRow(event: any) {
    if (event == "Physical Examination") {
      this.addItemRowForTOPHYEXAM();
    } else if (event == 'Functional Assessment') {
      this.addItemRowForTOFUNASS()
    }
    //  else {
    //   this.defaultAddRowforTOINFECTIONS()
    // }
  }



  isDockeyAvailable(): boolean {
    return this.scalesList.some(scale => scale.Dockey && scale.Dockey.trim() !== '');
  }

  //------------ Alergey managemenet  (start) ------------
  public openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
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
  //------------ Alergey managemenet  (ends) ------------




  //------------ Scal section  (starts) ------------
  openModalForScales(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class:
        'modal-dialog modal-dialog-centered medication-order-case modal-xl',
    };
    this.modalRefScales = this.modalService.show(template, config);
    this.loadScalesData();
    // this.medicationImportDrugArray=[];
  }

  scalesImport() {

    this.selectedScales.forEach((element) => {
      this.scalesList.forEach((res: any) => {
        if (element.Scaletype == res.ScaleType && element.Score) {
          res.Datetimee = element.DateTime,
            // res.Dockey = element.Dockey, //this is commented because we are not getting it from the backendside
            res.Dockey = this.docKey; // manually patching doc form stored in vaiable
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

  removeScale(index: number) {
    this.scalesList[index].LastScore = "";
    this.scalesList[index].ScoreDesc = "";
    this.scalesList[index].Dockey = "";
    this.scalesList[index].Datetimee = "";
  }

  // Note : old function
  // public viewGlosgowModel(item) {
  //
  //   if (this.noScaleAppicable) return;
  //   if (item.value == '1') {
  //     if (item.Dockey) {
  //       this.scalesGlosgow.openModalForGlosgow(item.Dockey);
  //     } else {
  //       this.sharedService.waringSwallModel('No data found');
  //     }
  //   }
  // }

  //New function
  public viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.Dockey) {

      if (item.value == '1') {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else if (item.value == '2') {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else if (item.value == '3') {
        this.bradenScaleTemp.openBradenScaleModal(item.Dockey);
      }
    } else {
      this.sharedService.waringSwallModel('No data found');
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

  collectAllScalesData(event: any) {
    if (event.target.checked) {
      this.selectedScales = (Object.assign([], this.toScaleArr));
    } else {
      this.selectedScales = [];
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


  //------------ Scal section  (ends) ------------





  //------------ Medication & Substance section  (starts) ------------


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
















  loadScalesData() {
    // this.selectedScales = [];
    this.toScaleArr = [];
    let patnr = this.ePrescriptionService.parameters.patnr;
    patnr = patnr.padStart(10, '0');
    const scalesOrders: Subscription = this.ePrescriptionService.loadData(`e-prescription/ScalesList?Patnr=${patnr}`, false, false, false, false).subscribe((resp: any) => {
      console.log(resp)
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        if (resp.body?.d?.results.length) {
          let requiredScales = ["Glasgow Coma Scale", "Morse Fall Scale (MFS)", "Braden scale for predicting pressure ulcers"];
          this.toScaleArr = resp.body.d.results.filter(scale => requiredScales.includes(scale.Scaletype)).map(scale => ({ ...scale, isSelected: false }));
        }
      }
      //   this.filterEvents();
    }, () => { scalesOrders.unsubscribe(); });
  }



  // get items(): FormArray {
  //   return this.nursingAdmissionForm.get('TOINFECTION') as FormArray;
  // }


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
  medicationImportDrugArrayListData($event) {
    this.toADMMEDImportedData = $event
  }

  physicianExamaminationArrayListData($event) {
    this.toPHYEXAMmportedData = $event
  }





}
