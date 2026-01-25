import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PhysicianAllergyComponent } from 'src/app/shared-module/paediatrics-adm-document/physician-allergy/physician-allergy.component';
import Swal from 'sweetalert2';
import { ErVitalsForSBARComponent } from '../sbar-nursing-endorsement/er-vitals/er-vitals.component';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { AdmissionService } from '@services/admission/admission.service';
import { MedicationOrderTypeLabels } from '@services/interfaces/common.enum';

@Component({
  selector: 'app-nursing-initial-assessment',
  templateUrl: './nursing-initial-assessment.component.html',
  styleUrls: ['./nursing-initial-assessment.component.scss']
})
export class NursingInitialAssessmentComponent implements OnInit {
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsForSBARComponent;
  @Input() isReadOnly: boolean = false;

  orderType = MedicationOrderTypeLabels;
  nursingFormGroup: FormGroup;
  activeTab: string = 'persoalData'
  activeTab3: string = 'postPartumAssessment'
  activeTab2: string = 'functionalAssessment'
  public CurrentDateAndTime: Date = new Date();
  items: []
  toVitalsArr: any = [];
  toAllergyArr: any = [];
  statusDescriptions = [
    { id: 0, label: 'Normal' },
    { id: 1, label: 'Birth Defects' },
    { id: 2, label: 'Premature' },
    { id: 3, label: 'Post Mature' }
  ];
  public gender = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' },
    { value: '3', label: 'UnKnown' }
  ]
  bloodGroups = [
    { id: '0', label: 'A-' },
    { id: '1', label: 'A+' },
    { id: '2', label: 'B-' },
    { id: '3', label: 'B+' },
    { id: '4', label: 'O-' },
    { id: '5', label: 'O+' },
    { id: '6', label: 'AB-' },
    { id: '7', label: 'AB+' }
  ];
  pain = [
    { id: '0', label: '1' },
    { id: '1', label: '2' },
    { id: '2', label: '3' },
    { id: '3', label: '4' },
    { id: '4', label: '5' },
    { id: '5', label: '6' },
    { id: '6', label: '7' },
    { id: '7', label: '8' },
    { id: '8', label: '9' },
    { id: '9', label: '10' },
  ];

  status = [
    { value: '0', label: 'Normal' },
    { value: '1', label: 'Birth Defects' },
    { value: '2', label: 'Premature' },
    { value: '3', label: 'Post Mature' },
  ];
  currentTime: any;
  paramsObject: any;
  apiJson: any;
  docKey: any;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  allergyInformation: any;

  constructor(private modalService: BsModalService, private ePrescriptionService: EPrescriptionService, public storageService: StorageService, private admissionService: AdmissionService,
    private sharedService: SharedService, private route: ActivatedRoute, private fb: FormBuilder, private dataShareService: DataShareService, private emergencyService: EmergencyService
  ) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;

    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
    this.apiJson = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr,
      Lfdbw: this.storageService.lfdnr
    }
    this.initForm();
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Add$ && data.value == '') {
          this.docKey = data.value.Dockey
        }
        if (data.type == ActionType.Update$ && data.value) {
          this.docKey = data.value.docKey
          this.getNurseDocDetail(data.value.docKey)
        }
        if (data.type == ActionType.Copy$ && data.value) {
          this.docKey = data.value.docKey
          this.getNurseDocDetail(data.value.docKey)
        }
      } else if (data.type == ActionType.Copy$ && data.value) {
        this.docKey = data.value.docKey
        this.getNurseDocDetail(data.value.docKey)
      } else {
        // for after code
      }
    });

    this.riskform = this.fb.group({
      riskFormitems: new FormArray([]),
    });
    this.updateRiskForm = this.fb.group({
      Rsfnr: [''],
      Rsfna: [''],
      Rsfkb: [''],
      Rsfsn: [''],
      Repdt: [''],
    });
  }


  ngOnInit() {
    if (this.isReadOnly) {
      this.getNurseDocDetail(this.admissionService.selectedCurrentDocDetails.Dockey)
    }
    this.nursingFormGroup.valueChanges.subscribe(() => {
      this.calculateNutritionalRisk();
    });
  }

  calculateNutritionalRisk(): void {
    const fields = [
      'NDiabetic',
      'NSevereAnorexia',
      'NLactating',
      'NVitamins',
      'NSwallowing',
      'NSpecialDiet',
      'NGiDisturbance'
    ];

    let total = 0;

    fields.forEach(field => {
      const val = +this.nursingFormGroup.get(field)?.value;
      if (!isNaN(val)) {
        total += val;
      }
    });

    // Bind result
    this.nursingFormGroup.get('NPatientRiskResult')?.setValue(total, { emitEvent: false });

    // Optional: Set risk category
    let riskText = '';
    if (total <= 4) {
      riskText = 'No Nutritional Risk';
    } else {
      riskText = 'High Nutritional Risk';
    }

    this.nursingFormGroup.get('NPatientRiskResultTxt')?.setValue(riskText, { emitEvent: false });
  }

  initForm() {
    console.log(this.storageService, "--")
    if(this.storageService.patientData.allergyInfo == 'The patient has no known allergies' || this.storageService.patientData.allergyInfo == 'The patient has no allergy assessment') {
      this.allergyInformation = 'No know allergies';
    } else if (this.storageService.patientData.allergyInfo == 'The patient has no possible allergy assessment') {
      this.allergyInformation = 'No possible allergy assessment';
    } else {
      this.allergyInformation = 'Allergy Exists';
    }
    this.nursingFormGroup = this.fb.group({
      Dockey: [''],
      Dtid: ['ZMED_NIAGO'],
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: [this.storageService.patientData.deptOrgUnit],
      AttendPhy: [this.storageService.getUserProfile().Gpart],
      DocStatus: ['1'],
      Datee: [new Date()],
      Timee: [this.currentTime],

      RObservation: [false],
      RLabour: [false],
      RAntePartum: [false],
      RPostPartum: [false],
      RTermination: [false],
      RCaesarean: [false],
      ROther: [false],
      ROtherTxt: [''],

      PPatientOcc: [''],
      PLHighSchool: [false],
      PLIlliterate: [false],
      PLUniversity: [false],
      PLOther: [false],
      PLOtherTxt: [''],
      PMaritalStatus: [this.storageService.patientData.maritalStatus],

      PBSentFamily: [false],
      POBedControls: [false],
      POBathroomEmergency: [false],
      POSideRails: [false],
      PONurseCall: [false],
      POMealsTime: [false],
      POPatientFamily: [false],
      POTelevision: [false],
      POSmoking: [false],
      POQibia: [false],
      POTelephone: [false],
      PORiskFall: [false],

      PMNoIllness: [false],
      PMDm: [false],
      PMHypertension: [false],
      PMEmotionalDisorder: [false],
      PMDrugAbuse: [false],
      PMVictimAbuse: [false],
      PMAsthma: [false],
      PMRespProblems: [false],
      PMRenalProblems: [false],
      PMCardiacProblem: [false],
      PMBloodReaction: [false],
      PMEpilepsy: [false],
      PMMajorSurgery: [false],
      PMPostAnesthesia: [false],
      PMHxDvt: [false],
      PMCriticallyIll: [false],
      PMCancerPatient: [false],
      PMDying: [false],
      PMImmunocompromised: [false],
      PMReceiving: [false],
      PMCommunicable: [false],
      PMComplications: [''],
      PMOther: [false],
      PMOtherTxt: [''],

      PaDoYouHave: [''],
      PaSlHeadache: [false],
      PaSlBreast: [false],
      PaSlAbdominalCramps: [false],
      PaSlIncisionSite: [false],
      PaSlLowBack: [false],
      PaSlLegCalf: [false],
      PaSlPerineum: [false],
      PaSlAnal: [false],
      PaSlWholeBody: [false],
      PaSlOther: [false],
      PaSlOtherTxt: [''],
      PaPainIntensity: [false],
      PaPainIntensity1: [''],
      PaSleepingNight: [''],
      PaParticipatingActivities: [''],
      PaPainEveryday: [''],

      SSleepProblem: [''],
      SSleepingDifficulty: [false],
      SAwakeFrequently: [false],
      SSleepingAids: [false],

      NDiabetic: [''],
      NSevereAnorexia: [''],
      NLactating: [''],
      NVitamins: [''],
      NSwallowing: [''],
      NSpecialDiet: [''],
      NGiDisturbance: [''],
      NComments: [''],
      NPatientRiskResult: [''],
      NPatientRiskResultTxt: [''],
      NReferDietician: [''],
      NNameDietician: [''],

      PhGravida: [''],
      PhPara: [''],
      PhAbortion: [''],
      PhNoAlive: [''],
      PhNoDead: [''],
      PhLmp: [new Date()],
      PhBloodGroup: [''],
      PhEdd: [new Date()],
      PhGestationalAge: [''],
      PhNoPastOb: [false],
      PhPartumDepression: [false],
      PhPartumHemorrhage: [false],
      PhPreviousCs: [''],
      PhNoCs: [''],
      PhDateLastCs: [new Date()],
      PhHepatitisA: [''],
      PhHepatitisB: [''],
      PhHepatitisC: [''],

      SkSkinProblem: [''],
      SkWound: [false],
      SkPressureUlcer: [false],
      SkDry: [false],
      SkPale: [false],
      SkCyanosis: [false],
      SkRashes: [false],

      FaFunctional: [''],
      FaParalysis: [false],
      FaMuscularWeakness: [false],
      FaWithWalkingAids: [false],
      FaSensoryImpairment: [false],

      SeDependent: [false],
      SeIndependent: [false],
      SeRestless: [false],
      SeCalm: [false],
      SeStressed: [false],
      SeCrying: [false],
      SeDistressed: [false],
      SeIrritable: [false],
      SeSad: [false],
      SeAfraid: [false],
      SeGrieving: [false],
      SeRefuseCare: [false],
      SeNoResponses: [false],
      SeHerFamily: [false],
      SeHusbandFamily: [false],

      NaOrientedTo: [false],
      NaOTime: [false],
      NaOPlace: [false],
      NaOPerson: [false],
      NaDisorientedTo: [false],
      NaDTime: [false],
      NaDPlace: [false],
      NaDPerson: [false],
      NaAlObeysCommand: [false],
      NaAlRespondsTo: [false],
      NaAlVoice: [false],
      NaAlPain: [false],
      NaAlUnresponsive: [false],
      NaAlAmnesiac: [false],
      NaSpeech: [''],
      NaOrderingPhysician: [''],

      RaRespiratory: [''],
      RaDryCough: [false],
      RaWheezing: [false],
      RaProductiveCough: [false],
      RaCrackles: [false],
      RaGrasping: [false],
      RaSuction: [false],
      RaSuctionR: [''],
      RaSecretion: [''],
      RaFrequency: [''],
      RaCyanotic: [false],
      RaCyanoticR: [''],
      RaOnOxygen: [''],
      RaNc: [''],
      RaFm: [''],
      RaOthers: [false],
      RaOthersTxt: [''],

      CaCardiovascular: [''],
      CaCardiovascularTxt: [''],
      CaHeartRate: [''],
      CaChestPain: [''],
      CaCapillary: [''],
      CaCapillaryTxt: [''],

      SMDeliveryDate: [new Date()],
      SMDeliveryTime: [this.currentTime],
      SMGa: [''],
      SMTypeDelivery: [false],
      SMTVaginal: [false],
      SMTForceps: [false],
      SMTVacuum: [false],
      SMTSpontaneous: [false],
      SMTCaesarean: [false],
      SMTElective: [false],
      SMTEmergency: [false],
      SMAGa: [false],
      SMAEpidural: [false],
      SMASpinal: [false],
      SMANone: [false],
      SMDActiveBaby: [false],
      SMDIufd: [false],
      SMDDeadBaby: [false],
      SMDCongenital: [false],
      SMDStillBaby: [false],

      SBVertex: [false],
      SBBreech: [false],
      SBTransverse: [false],
      SBNormalNursery: [false],
      SBNicu: [false],

      PpaNotApplicable: false,
      PpaUterineMassage: "",
      PpaUterineMassageTxt: "",
      PpaFAboveUmbilicus: false,
      PpaFUnderUmbilicus: false,
      PpaFUmbilicalLevel: false,
      PpaUContracted: false,
      PpaUFirm: false,
      PpaUAtony: false,
      PpaVMild: false,
      PpaVModerate: false,
      PpaVSevere: false,
      PpaSDone: false,
      PpaSNotDone: false,
      PpaVpNoVaginalPack: false,
      PpaVpSoaked: false,
      PpaVpDry: false,
      PpaEpisiotomy: "",
      PpaBNormal: false,
      PpaBEngorged: false,
      PpaBWarm: false,
      PpaBSoreNipple: false,
      PpaBFullTender: false,
      PpaBPainful: false,
      PpaBmNormal: false,
      PpaBmPassGases: false,
      PpaBmConstipated: false,
      PpaBmNeedLaxative: false,
      PpaAAmbulated: false,
      PpaANeedAssistance: false,
      PpaABedRest: false,
      PpaInNotApplicable: false,
      PpaInWithDrains: false,
      PpaInCleanIntact: false,
      PpaInDressingApplied: false,
      PpaInRedness: false,
      PpaInDischarge: false,
      PpaInOozingDressing: false,
      PpaInSoakedDressing: false,
      PpaBladder: "",
      PpaVoid: "",
      PpaPaNormal: false,
      PpaPaEdema: false,
      PpaPaHematoma: false,
      EdCoLanguage: false,
      EdCoBeliefs: false,
      EdCoLiteracy: false,
      EdCoCultural: false,
      EdCoOthers: false,
      EdCoOthersTxt: "",
      EdPatientReadiness: "",
      EdPrOthers: false,
      EdPrOthersTxt: "",
      EdFamilyReadiness: "",
      EdFrOthers: false,
      EdFrOthersTxt: "",
      EdMeOral: false,
      EdMeVideo: false,
      EdMeHandout: false,
      EdMeOthers: false,
      EdMeOthersTxt: "",
      EdMedicationTeaching: "",
      EdMtRemarks: false,
      EdMtRemarksTxt: "",
      EdModeIncision: "",
      EdMiRemarks: false,
      EdMiRemarksTxt: "",
      EdFamilyTeaching: "",
      EdFtRemarks: false,
      EdFtRemarksTxt: "",
      EdChronicIllness: "",
      EdCiRemarks: false,
      EdCiRemarksTxt: "",
      EdTeachingEquipment: "",
      EdTeRemarks: false,
      EdTeRemarksTxt: "",
      EdBreastFeeding: "",
      EdBfRemarks: false,
      EdBfRemarksTxt: "",
      EdCareNewborn: "",
      EdCnRemarks: false,
      EdCnRemarksTxt: "",
      EdSitzBath: "",
      EdSbRemarks: false,
      EdSbRemarksTxt: "",
      EdEpisiotomyCare: "",
      EdEcRemarks: false,
      EdEcRemarksTxt: "",
      EdNeedRest: "",
      EdNrRemarks: false,
      EdNrRemarksTxt: "",
      EdCircumcisionCare: "",
      EdCcRemarks: false,
      EdCcRemarksTxt: "",
      DpDischargePlan: "",
      DpAnticipated: "",
      DpMedications: "",
      DpWoundSiteCare: "",
      DpBabyCare: "",
      DpBreastFeeding: "",
      DpNutrition: "",
      DpOthers: "",
      DcEnsurePatient: "",
      DcEnsureRelatives: "",
      DcPatientFamily: "",
      DcMedicationGiven: "",
      DcIvCannula: "",
      DcTransportArranged: "",
      DcOutPatientApp: "",
      DcGiveRelevant: "",
      DcMedicalReport: "",
      DcSpecialNeeds: "",
      DcOthers: "",
      DcAdditionalRemarks: "",

      TOALLERGY: this.fb.array([]),
      TOVITALSIGN: this.fb.array([]),
      TOMEDICATION: this.fb.array([]),
      TORISKFACTOR: this.fb.array([]),
      TOBABY: this.fb.array([]),
    });

    for (let i = 0; i < 4; i++) {
      this.addBaby();
    }

    this.getPatientDeliveryDetails();

    this.nursingFormGroup.get('SSleepProblem')?.valueChanges.subscribe(val => {
      const disabled = val !== '1';
      ['SSleepingDifficulty', 'SAwakeFrequently', 'SSleepingAids'].forEach(control => {
        if (disabled) {
          this.nursingFormGroup.get(control)?.disable();
          this.nursingFormGroup.get(control)?.setValue(false);
        } else {
          this.nursingFormGroup.get(control)?.enable();
        }
      });
    });
    this.nursingFormGroup.get('PaDoYouHave')?.valueChanges.subscribe(val => {
      const disabled = val !== '1';
      ['PaSlHeadache', 'PaSlBreast', 'PaSlIncisionSite', 'PaSlLowBack', 'PaSlLegCalf', 'PaSlAbdominalCramps', 'PaSlPerineum', 'PaSlAnal', 'PaSlWholeBody', 'PaSlOther'].forEach(control => {
        if (disabled) {
          this.nursingFormGroup.get(control)?.disable();
          this.nursingFormGroup.get(control)?.setValue(false);
        } else {
          this.nursingFormGroup.get(control)?.enable();
        }
      });
    });
    this.nursingFormGroup.get('SkSkinProblem')?.valueChanges.subscribe(val => {
      const disabled = val !== '1';
      ['SkPale', 'SkCyanosis', 'SkRashes', 'SkWound', 'SkPressureUlcer', 'SkDry'].forEach(control => {
        if (disabled) {
          this.nursingFormGroup.get(control)?.disable();
          this.nursingFormGroup.get(control)?.setValue(false);
        } else {
          this.nursingFormGroup.get(control)?.enable();
        }
      });
    });
    this.nursingFormGroup.get('FaFunctional')?.valueChanges.subscribe(val => {
      const disabled = val !== '1';
      ['FaParalysis', 'FaMuscularWeakness', 'FaWithWalkingAids', 'FaSensoryImpairment'].forEach(control => {
        if (disabled) {
          this.nursingFormGroup.get(control)?.disable();
          this.nursingFormGroup.get(control)?.setValue(false);
        } else {
          this.nursingFormGroup.get(control)?.enable();
        }
      });
    });
  }

  getPatientDeliveryDetails() {
    this.emergencyService
      .fetchPatientDeliveryDetail(this.paramsObject.falnr)
      .subscribe((response: any) => {
        const deliveryDetails = response?.d?.results[0];
        const neonatalArray = deliveryDetails.TOPATDEL.results || [];

        if (neonatalArray.length) {
          const formArray = this.TOBABY;
          formArray.clear();

          // Loop and add each neonatal entry
          neonatalArray.forEach((item, index) => {
            const convertedItem = {
              Dockey: deliveryDetails.Faln1,
              No: (index + 1).toString(),
              Time: item.Gbtim,
              Sex: item.Gschl,
              Wt: item.Gbgew,
              ApgarScore1: item.Bwert,
              ApgarScore5: item.Bwert5,
              ApgarScore10: item.Bwert10,
              StatusDesc: ''
            };
            this.addBaby(convertedItem);
          });
        }
      });
  }

  get TOALLERGY(): FormArray {
    return this.nursingFormGroup.get('TOALLERGY') as FormArray;
  }

  get TOVITALSIGN(): FormArray {
    return this.nursingFormGroup.get('TOVITALSIGN') as FormArray;
  }

  get TOMEDICATION(): FormArray {
    return this.nursingFormGroup.get('TOMEDICATION') as FormArray;
  }

  get TORISKFACTOR(): FormArray {
    return this.nursingFormGroup.get('TORISKFACTOR') as FormArray;
  }

  get TOBABY(): FormArray {
    return this.nursingFormGroup.get('TOBABY') as FormArray;
  }

  addAllergy(data: any) {
    this.TOALLERGY.push(this.fb.group({
      Dockey: [data.Dockey || ''],
      Agroup: [data.Agroup || ''],
      Description: [data.Description || '']
    }));
  }

  addVitalSign(data: any) {
    this.TOVITALSIGN.push(this.fb.group({
      Dockey: [data.Dockey || ''],
      Vdescription: [data.Vdescription || ''],
      MeasuredValue: [data.MeasuredValue || ''],
      NormalRange: [data.NormalRange || ''],
      DateTime: [data.DateTime || ''],
      Vunit: [data.Vunit || '']
    }));
  }

  addMedication(data: any) {
    this.TOMEDICATION.push(this.fb.group({
      Dockey: [data.Dockey || ''],
      OrderType: [data.OrderType || ''],
      Description: [data.Description || ''],
      HomeMedication: [data.HomeMedication || false],
      PatientOwnMed: [data.PatientOwnMed || false],
      Dose: [data.Dose || ''],
      Validity: [data.Validity || ''],
      Route: [data.Route || ''],
      Amount: [data.Amount || ''],
      Rate: [data.Rate || ''],
      Therapy: [data.Therapy || ''],
      Id: [data.Id || ''],
      OrderingPhysician: [data.OrderingPhysician || ''],
      Cycle: [data.Cycle || '']
    }));
  }

  addRiskFactor(data: any) {
    this.TORISKFACTOR.push(this.fb.group({
      Dockey: [data.Dockey || ''],
      Id: [data.Id || ''],
      Desc: [data.Desc || ''],
      Code: [data.Code || '']
    }));
  }

  addBaby(data?: any) {
    this.TOBABY.push(this.fb.group({
      Dockey: [data?.Dockey || ''],
      No: [data?.No || ''],
      Time: [this.parseTime(data?.Time) || this.currentTime],
      Sex: [data?.Sex || ''],
      ApgarScore1: [data?.ApgarScore1 || ''],
      ApgarScore5: [data?.ApgarScore5 || ''],
      ApgarScore10: [data?.ApgarScore10 || ''],
      StatusDesc: [data?.StatusDesc || ''],
      Wt: [data?.Wt ?? ''],
    }));
  }

  getNurseDocDetail(docKey?: any) {
    this.subscription = this.emergencyService.fetchNursingInitialGynoDocument(docKey).subscribe({
      next: (apiResponse: any) => {
        const response = apiResponse?.d?.results?.[0] || {};
        this.nursingFormGroup.patchValue({
          Datee: this.getDate(response.Datee),
          PhDateLastCs: this.getDate(response.PhDateLastCs),
          SMDeliveryDate: this.getDate(response.SMDeliveryDate),
          PhEdd: this.getDate(response.PhEdd),
          PhLmp: this.getDate(response.PhLmp),
          SMDeliveryTime: this.parseTime(response.SMDeliveryTime),
          Timee: this.parseTime(response.Timee),
          Dockey: response.Dockey,
          Dtid: response.Dtid,
          Einri: response.Einri,
          Patnr: response.Patnr,
          Falnr: response.Falnr,
          Lfdnr: response.Lfdnr,
          Orgdo: this.storageService.patientData.deptOrgUnit,
          AttendPhy: this.storageService.getUserProfile().Gpart,
          DocStatus: response.DocStatus,

          RObservation: response.RObservation,
          RLabour: response.RLabour,
          RAntePartum: response.RAntePartum,
          RPostPartum: response.RPostPartum,
          RTermination: response.RTermination,
          RCaesarean: response.RCaesarean,
          ROther: response.ROther,
          ROtherTxt: response.ROtherTxt,

          PPatientOcc: response.PPatientOcc,
          PLHighSchool: response.PLHighSchool,
          PLIlliterate: response.PLIlliterate,
          PLUniversity: response.PLUniversity,
          PLOther: response.PLOther,
          PLOtherTxt: response.PLOtherTxt,
          PMaritalStatus: response.PMaritalStatus,

          PBSentFamily: response.PBSentFamily,
          POBedControls: response.POBedControls,
          POBathroomEmergency: response.POBathroomEmergency,
          POSideRails: response.POSideRails,
          PONurseCall: response.PONurseCall,
          POMealsTime: response.POMealsTime,
          POPatientFamily: response.POPatientFamily,
          POTelevision: response.POTelevision,
          POSmoking: response.POSmoking,
          POQibia: response.POQibia,
          POTelephone: response.POTelephone,
          PORiskFall: response.PORiskFall,

          PMNoIllness: response.PMNoIllness,
          PMDm: response.PMDm,
          PMHypertension: response.PMHypertension,
          PMEmotionalDisorder: response.PMEmotionalDisorder,
          PMDrugAbuse: response.PMDrugAbuse,
          PMVictimAbuse: response.PMVictimAbuse,
          PMAsthma: response.PMAsthma,
          PMRespProblems: response.PMRespProblems,
          PMRenalProblems: response.PMRenalProblems,
          PMCardiacProblem: response.PMCardiacProblem,
          PMBloodReaction: response.PMBloodReaction,
          PMEpilepsy: response.PMEpilepsy,
          PMMajorSurgery: response.PMMajorSurgery,
          PMPostAnesthesia: response.PMPostAnesthesia,
          PMHxDvt: response.PMHxDvt,
          PMCriticallyIll: response.PMCriticallyIll,
          PMCancerPatient: response.PMCancerPatient,
          PMDying: response.PMDying,
          PMImmunocompromised: response.PMImmunocompromised,
          PMReceiving: response.PMReceiving,
          PMCommunicable: response.PMCommunicable,
          PMComplications: response.PMComplications,
          PMOther: response.PMOther,
          PMOtherTxt: response.PMOtherTxt,

          PaDoYouHave: response.PaDoYouHave,
          PaSlHeadache: response.PaSlHeadache,
          PaSlBreast: response.PaSlBreast,
          PaSlAbdominalCramps: response.PaSlAbdominalCramps,
          PaSlIncisionSite: response.PaSlIncisionSite,
          PaSlLowBack: response.PaSlLowBack,
          PaSlLegCalf: response.PaSlLegCalf,
          PaSlPerineum: response.PaSlPerineum,
          PaSlAnal: response.PaSlAnal,
          PaSlWholeBody: response.PaSlWholeBody,
          PaSlOther: response.PaSlOther,
          PaSlOtherTxt: response.PaSlOtherTxt,
          PaPainIntensity: response.PaPainIntensity,
          PaPainIntensity1: response.PaPainIntensity1,
          PaSleepingNight: response.PaSleepingNight,
          PaParticipatingActivities: response.PaParticipatingActivities,
          PaPainEveryday: response.PaPainEveryday,

          SSleepProblem: response.SSleepProblem,
          SSleepingDifficulty: response.SSleepingDifficulty,
          SAwakeFrequently: response.SAwakeFrequently,
          SSleepingAids: response.SSleepingAids,

          NDiabetic: response.NDiabetic,
          NSevereAnorexia: response.NSevereAnorexia,
          NLactating: response.NLactating,
          NVitamins: response.NVitamins,
          NSwallowing: response.NSwallowing,
          NSpecialDiet: response.NSpecialDiet,
          NGiDisturbance: response.NGiDisturbance,
          NComments: response.NComments,
          NPatientRiskResult: response.NPatientRiskResult,
          NPatientRiskResultTxt: response.NPatientRiskResultTxt,
          NReferDietician: response.NReferDietician,
          NNameDietician: response.NNameDietician,

          PhGravida: response.PhGravida,
          PhPara: response.PhPara,
          PhAbortion: response.PhAbortion,
          PhNoAlive: response.PhNoAlive,
          PhNoDead: response.PhNoDead,
          PhBloodGroup: response.PhBloodGroup,
          PhGestationalAge: response.PhGestationalAge,
          PhNoPastOb: response.PhNoPastOb,
          PhPartumDepression: response.PhPartumDepression,
          PhPartumHemorrhage: response.PhPartumHemorrhage,
          PhPreviousCs: response.PhPreviousCs,
          PhNoCs: response.PhNoCs,
          PhHepatitisA: response.PhHepatitisA,
          PhHepatitisB: response.PhHepatitisB,
          PhHepatitisC: response.PhHepatitisC,

          // Skin
          SkSkinProblem: response.SkSkinProblem,
          SkWound: response.SkWound,
          SkPressureUlcer: response.SkPressureUlcer,
          SkDry: response.SkDry,
          SkPale: response.SkPale,
          SkCyanosis: response.SkCyanosis,
          SkRashes: response.SkRashes,

          // Functional
          FaFunctional: response.FaFunctional,
          FaParalysis: response.FaParalysis,
          FaMuscularWeakness: response.FaMuscularWeakness,
          FaWithWalkingAids: response.FaWithWalkingAids,
          FaSensoryImpairment: response.FaSensoryImpairment,

          // Emotional
          SeDependent: response.SeDependent,
          SeIndependent: response.SeIndependent,
          SeRestless: response.SeRestless,
          SeCalm: response.SeCalm,
          SeStressed: response.SeStressed,
          SeCrying: response.SeCrying,
          SeDistressed: response.SeDistressed,
          SeIrritable: response.SeIrritable,
          SeSad: response.SeSad,
          SeAfraid: response.SeAfraid,
          SeGrieving: response.SeGrieving,
          SeRefuseCare: response.SeRefuseCare,
          SeNoResponses: response.SeNoResponses,
          SeHerFamily: response.SeHerFamily,
          SeHusbandFamily: response.SeHusbandFamily,

          // Neurological Assessment
          NaOrientedTo: response.NaOrientedTo,
          NaOTime: response.NaOTime,
          NaOPlace: response.NaOPlace,
          NaOPerson: response.NaOPerson,
          NaDisorientedTo: response.NaDisorientedTo,
          NaDTime: response.NaDTime,
          NaDPlace: response.NaDPlace,
          NaDPerson: response.NaDPerson,
          NaAlObeysCommand: response.NaAlObeysCommand,
          NaAlRespondsTo: response.NaAlRespondsTo,
          NaAlVoice: response.NaAlVoice,
          NaAlPain: response.NaAlPain,
          NaAlUnresponsive: response.NaAlUnresponsive,
          NaAlAmnesiac: response.NaAlAmnesiac,
          NaSpeech: response.NaSpeech,
          NaOrderingPhysician: response.NaOrderingPhysician,

          // Respiratory Assessment
          RaRespiratory: response.RaRespiratory,
          RaDryCough: response.RaDryCough,
          RaWheezing: response.RaWheezing,
          RaProductiveCough: response.RaProductiveCough,
          RaCrackles: response.RaCrackles,
          RaGrasping: response.RaGrasping,
          RaSuction: response.RaSuction,
          RaSuctionR: response.RaSuctionR,
          RaSecretion: response.RaSecretion,
          RaFrequency: response.RaFrequency,
          RaCyanotic: response.RaCyanotic,
          RaCyanoticR: response.RaCyanoticR,
          RaOnOxygen: response.RaOnOxygen,
          RaNc: response.RaNc,
          RaFm: response.RaFm,
          RaOthers: response.RaOthers,
          RaOthersTxt: response.RaOthersTxt,

          // Cardiovascular Assessment
          CaCardiovascular: response.CaCardiovascular,
          CaCardiovascularTxt: response.CaCardiovascularTxt,
          CaHeartRate: response.CaHeartRate,
          CaChestPain: response.CaChestPain,
          CaCapillary: response.CaCapillary,
          CaCapillaryTxt: response.CaCapillaryTxt,

          // Summary of Delivery
          SMGa: response.SMGa,
          SMTypeDelivery: response.SMTypeDelivery,
          SMTVaginal: response.SMTVaginal,
          SMTForceps: response.SMTForceps,
          SMTVacuum: response.SMTVacuum,
          SMTSpontaneous: response.SMTSpontaneous,
          SMTCaesarean: response.SMTCaesarean,
          SMTElective: response.SMTElective,
          SMTEmergency: response.SMTEmergency,
          SMAGa: response.SMAGa,
          SMAEpidural: response.SMAEpidural,
          SMASpinal: response.SMASpinal,
          SMANone: response.SMANone,
          SMDActiveBaby: response.SMDActiveBaby,
          SMDIufd: response.SMDIufd,
          SMDDeadBaby: response.SMDDeadBaby,
          SMDCongenital: response.SMDCongenital,
          SMDStillBaby: response.SMDStillBaby,

          SBVertex: response.SBVertex,
          SBBreech: response.SBBreech,
          SBTransverse: response.SBTransverse,
          SBNormalNursery: response.SBNormalNursery,
          SBNicu: response.SBNicu,

          // Postpartum Assessment
          PpaNotApplicable: response.PpaNotApplicable,
          PpaUterineMassage: response.PpaUterineMassage,
          PpaUterineMassageTxt: response.PpaUterineMassageTxt,
          PpaFAboveUmbilicus: response.PpaFAboveUmbilicus,
          PpaFUnderUmbilicus: response.PpaFUnderUmbilicus,
          PpaFUmbilicalLevel: response.PpaFUmbilicalLevel,
          PpaUContracted: response.PpaUContracted,
          PpaUFirm: response.PpaUFirm,
          PpaUAtony: response.PpaUAtony,
          PpaVMild: response.PpaVMild,
          PpaVModerate: response.PpaVModerate,
          PpaVSevere: response.PpaVSevere,
          PpaSDone: response.PpaSDone,
          PpaSNotDone: response.PpaSNotDone,
          PpaVpNoVaginalPack: response.PpaVpNoVaginalPack,
          PpaVpSoaked: response.PpaVpSoaked,
          PpaVpDry: response.PpaVpDry,
          PpaEpisiotomy: response.PpaEpisiotomy,
          PpaBNormal: response.PpaBNormal,
          PpaBEngorged: response.PpaBEngorged,
          PpaBWarm: response.PpaBWarm,
          PpaBSoreNipple: response.PpaBSoreNipple,
          PpaBFullTender: response.PpaBFullTender,
          PpaBPainful: response.PpaBPainful,
          PpaBmNormal: response.PpaBmNormal,
          PpaBmPassGases: response.PpaBmPassGases,
          PpaBmConstipated: response.PpaBmConstipated,
          PpaBmNeedLaxative: response.PpaBmNeedLaxative,
          PpaAAmbulated: response.PpaAAmbulated,
          PpaANeedAssistance: response.PpaANeedAssistance,
          PpaABedRest: response.PpaABedRest,
          PpaInNotApplicable: response.PpaInNotApplicable,
          PpaInWithDrains: response.PpaInWithDrains,
          PpaInCleanIntact: response.PpaInCleanIntact,
          PpaInDressingApplied: response.PpaInDressingApplied,
          PpaInRedness: response.PpaInRedness,
          PpaInDischarge: response.PpaInDischarge,
          PpaInOozingDressing: response.PpaInOozingDressing,
          PpaInSoakedDressing: response.PpaInSoakedDressing,
          PpaBladder: response.PpaBladder,
          PpaVoid: response.PpaVoid,
          PpaPaNormal: response.PpaPaNormal,
          PpaPaEdema: response.PpaPaEdema,
          PpaPaHematoma: response.PpaPaHematoma,

          // Education - Cultural
          EdCoLanguage: response.EdCoLanguage,
          EdCoBeliefs: response.EdCoBeliefs,
          EdCoLiteracy: response.EdCoLiteracy,
          EdCoCultural: response.EdCoCultural,
          EdCoOthers: response.EdCoOthers,
          EdCoOthersTxt: response.EdCoOthersTxt,

          // Education - Patient and Family Readiness
          EdPatientReadiness: response.EdPatientReadiness,
          EdPrOthers: response.EdPrOthers,
          EdPrOthersTxt: response.EdPrOthersTxt,
          EdFamilyReadiness: response.EdFamilyReadiness,
          EdFrOthers: response.EdFrOthers,
          EdFrOthersTxt: response.EdFrOthersTxt,

          // Education - Methods
          EdMeOral: response.EdMeOral,
          EdMeVideo: response.EdMeVideo,
          EdMeHandout: response.EdMeHandout,
          EdMeOthers: response.EdMeOthers,
          EdMeOthersTxt: response.EdMeOthersTxt,

          // Medication Teaching
          EdMedicationTeaching: response.EdMedicationTeaching,
          EdMtRemarks: response.EdMtRemarks,
          EdMtRemarksTxt: response.EdMtRemarksTxt,

          // Mode of Incision
          EdModeIncision: response.EdModeIncision,
          EdMiRemarks: response.EdMiRemarks,
          EdMiRemarksTxt: response.EdMiRemarksTxt,

          // Family Teaching
          EdFamilyTeaching: response.EdFamilyTeaching,
          EdFtRemarks: response.EdFtRemarks,
          EdFtRemarksTxt: response.EdFtRemarksTxt,

          // Chronic Illness
          EdChronicIllness: response.EdChronicIllness,
          EdCiRemarks: response.EdCiRemarks,
          EdCiRemarksTxt: response.EdCiRemarksTxt,

          // Teaching Equipment
          EdTeachingEquipment: response.EdTeachingEquipment,
          EdTeRemarks: response.EdTeRemarks,
          EdTeRemarksTxt: response.EdTeRemarksTxt,

          // Breastfeeding
          EdBreastFeeding: response.EdBreastFeeding,
          EdBfRemarks: response.EdBfRemarks,
          EdBfRemarksTxt: response.EdBfRemarksTxt,

          // Care of Newborn
          EdCareNewborn: response.EdCareNewborn,
          EdCnRemarks: response.EdCnRemarks,
          EdCnRemarksTxt: response.EdCnRemarksTxt,

          // Sitz Bath
          EdSitzBath: response.EdSitzBath,
          EdSbRemarks: response.EdSbRemarks,
          EdSbRemarksTxt: response.EdSbRemarksTxt,

          // Episiotomy Care
          EdEpisiotomyCare: response.EdEpisiotomyCare,
          EdEcRemarks: response.EdEcRemarks,
          EdEcRemarksTxt: response.EdEcRemarksTxt,

          // Need Rest
          EdNeedRest: response.EdNeedRest,
          EdNrRemarks: response.EdNrRemarks,
          EdNrRemarksTxt: response.EdNrRemarksTxt,

          // Circumcision Care
          EdCircumcisionCare: response.EdCircumcisionCare,
          EdCcRemarks: response.EdCcRemarks,
          EdCcRemarksTxt: response.EdCcRemarksTxt,

          // Discharge Planning
          DpDischargePlan: response.DpDischargePlan,
          DpAnticipated: response.DpAnticipated,
          DpMedications: response.DpMedications,
          DpWoundSiteCare: response.DpWoundSiteCare,
          DpBabyCare: response.DpBabyCare,
          DpBreastFeeding: response.DpBreastFeeding,
          DpNutrition: response.DpNutrition,
          DpOthers: response.DpOthers,

          // Discharge Checklist
          DcEnsurePatient: response.DcEnsurePatient,
          DcEnsureRelatives: response.DcEnsureRelatives,
          DcPatientFamily: response.DcPatientFamily,
          DcMedicationGiven: response.DcMedicationGiven,
          DcIvCannula: response.DcIvCannula,
          DcTransportArranged: response.DcTransportArranged,
          DcOutPatientApp: response.DcOutPatientApp,
          DcGiveRelevant: response.DcGiveRelevant,
          DcMedicalReport: response.DcMedicalReport,
          DcSpecialNeeds: response.DcSpecialNeeds,
          DcOthers: response.DcOthers,
          DcAdditionalRemarks: response.DcAdditionalRemarks
        });

        this.toAllergyArr = response.TOALLERGY?.results;
        this.toVitalsArr = response.TOVITALSIGN?.results;
        this.medicationImportDrugArray = response.TOMEDICATION?.results;
        this.selectedRiskList = response.TORISKFACTOR?.results;

        if (response.TOBABY.results.length) {
          (this.nursingFormGroup.get('TOBABY') as FormArray).clear();
          response.TOBABY.results.forEach(group => this.addBaby(group));
        }
      },
      error: (err: any) => {
        this.sharedService.waringSwallModel(`Error ${err}`);
        this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
      },
    });
  }

  bindArray(field: string, list: any[], createFn: (item?: any) => FormGroup) {
    const arr = this.fb.array([]);
    if (list?.length) {
      list.forEach(item => arr.push(createFn.call(this, item)));
    } else {
      for (let i = 0; i < 4; i++) arr.push(createFn.call(this));
    }
    this.nursingFormGroup.setControl(field, arr);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;

  }
  setActiveTab2(tab: string): void {
    this.activeTab2 = tab;

  }
  setActiveTab3(tab: string): void {
    this.activeTab3 = tab;
  }

  modalRefUpdateName: BsModalRef;
  selectedMedicationOrder: any[] = [];
  drugArray: any[] = [];
  medicationImportDrugArray: any;
  toDiagnosisArr: any = [];
  duplicates: any = [];

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
    const profileOrderHistory: Subscription = this.ePrescriptionService
      .loadData(
        `e-prescription/OrderHistorylist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}`,
        false,
        false,
        false,
        false
      )
      .subscribe(
        (resp: any) => {
          if (
            resp.body &&
            resp.body.d &&
            resp.body.d.results &&
            resp.body.d.results.length
          ) {
            //this.configurationData = resp.body.d.results;
            this.drugArray = resp.body.d.results;
            // this.medicationImportDrugArray=[];
          }
          //   this.filterEvents();
        },
        () => {
          profileOrderHistory.unsubscribe();
        }
      );
  }

  medicationImport() {
    if (!this.medicationImportDrugArray) {
      this.medicationImportDrugArray = [];
    }

    this.selectedMedicationOrder.forEach((element) => {
      this.medicationImportDrugArray.push({
        Dockey: '',
        OrderType: this.orderType[element.MotypId],
        Description:
          element.Descrlt +
          element.Quan +
          element.Quanunit +
          element.Routedescr +
          element.N1id,
        HomeMedication: false,
        PatientOwnMed: false,
        Dose: element.Quan + element.Quanunit,
        Validity: `${new DatePipe('en-US').transform(
          this.getDate(element.StartD),
          'dd.MM.yyyy'
        )}-${new DatePipe('en-US').transform(
          this.getDate(element.EndD),
          'dd.MM.yyyy'
        )}`,
        Route: element.Routedescr,
        Amount: '',
        Rate: '',
        Therapy: '00000',
        Id: '',
        OrderingPhysician: element.EmpRespNm,
        Cycle: element.N1id,
      });
    });
    this.modalRefUpdateName.hide();
  }
  collectAllMedicationIData(event: any) {
    if (event.target.checked) {
      this.selectedMedicationOrder = Object.assign([], this.drugArray);
    } else {
      this.selectedMedicationOrder = [];
    }
  }
  isChecked(item: any): boolean {
    return this.selectedMedicationOrder.some((x) => x.Meordid == item.Meordid);
  }

  collectMedicationIData(event, item) {
    if (event.target.checked) {
      this.selectedMedicationOrder.push(item);
      // this.medicationImportDrugArray.push(item);
    } else {
      const indexOf = this.selectedMedicationOrder.findIndex(
        (x) => x.Meordid == item.Meordid
      );
      if (indexOf !== -1) this.selectedMedicationOrder.splice(indexOf, 1);
      // this.medicationImportDrugArray.splice(index, 1);
    }
  }

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
    if(this.toAllergyArr.length) {
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

  convertToPTTime(time) {
    var createTime = time.split(':')
    createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
    return createTime;
  }

  public deleteFromAllergy(item, index) {
    this.toAllergyArr.splice(index, 1);
    if(this.toAllergyArr.length) {
      this.allergyInformation = 'Allergy Exists';
    } else {
      this.allergyInformation = 'No know allergies';
    }
  }


  isCheckedVital: any = false;
  public handleCheckboxVitals(event) {
    this.isCheckedVital = event.target.checked;
  }


  public openModalVital() {
    if (this.isCheckedVital) return;
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }


  public createDoc(status?: any, actionType?: any) {
    return new Promise((resolve, reject) => {
      let formData = this.nursingFormGroup.value;
      formData.DocStatus = status;
      formData['TOMEDICATION'] = this.medicationImportDrugArray;
      let checkVitalList: any[] = this.toVitalsArr?.filter((res) => {
        delete res.Vunit;
        delete res.value;
        return res;
      });
      formData['TOVITALSIGN'] = checkVitalList;
      formData['TOALLERGY'] = this.toAllergyArr;
      formData['TORISKFACTOR'] = this.selectedRiskList;
      formData['TOBABY'] = formData.TOBABY
        .filter(res => res.Time || res.Sex || res.Wt || res.ApgarScore1 || res.ApgarScore5 || res.ApgarScore10 || res.StatusDesc)
        .map(res => {
          const { Wt, ...rest } = res; // destructure and remove Wt
          return {
            ...rest,
            Time: this.convertToPTTime(res.Time)
          };
        });
      formData.Datee = this.sanitizeSAPDateFormat(formData.Datee) || '',
        formData.NPatientRiskResult = formData.NPatientRiskResult ? formData.NPatientRiskResult.toString() : '',
        formData.PhDateLastCs = this.sanitizeSAPDateFormat(formData.PhDateLastCs) || '',
        formData.SMDeliveryDate = this.sanitizeSAPDateFormat(formData.SMDeliveryDate) || '',
        formData.PhEdd = this.sanitizeSAPDateFormat(formData.PhEdd) || '',
        formData.PhLmp = this.sanitizeSAPDateFormat(formData.PhLmp) || '',
        formData.SMDeliveryTime = formData.SMDeliveryTime ? this.convertToPTTime(formData.SMDeliveryTime) : 'PT00H00M00S',
        formData.Timee = formData.Timee ? this.convertToPTTime(formData.Timee) : 'PT00H00M00S',
        
        this.subscription = this.emergencyService.saveNursingInitialGyno(formData).subscribe({
          next: (data: any) => {
          },
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(`PUT Error at Nursing Initial Assessment Gyno Obstetrics PMD : ${err}`);
          },
          complete: () => {
            resolve(true);
            if (status === 'edit') {
              this.sharedService.successSwallModel('Nursing Initial Assessment Gyno Obstetrics PMD updated successfully');
            } else {
              this.sharedService.successSwallModel('Nursing Initial Assessment Gyno Obstetrics PMD created successfully');
            }
            // this.successEvent.next(true)
          }
        });
    })
  }

  parseDate(date: string) {
    if (date) {
      return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
    }
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  getDate(value) {
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


  modalRefForRisk: BsModalRef;
  modalRef: BsModalRef;
  selectedERList: any;
  isRiskUpdate: boolean;
  riskList: any[];
  riskValues: any;
  riskform: FormGroup;
  riskFormitems: FormArray;
  updateRiskForm: FormGroup;
  isFormValidError: boolean = false;
  colName: any;
  modalCommonDataArr: any;
  allergenValues: any;
  updateAllergyForm: FormGroup;


  public openModalForRisk(template: TemplateRef<any>) {
    // const config = ModalOptions = {
    //   class: 'modal-dialog-centered modal-xl risk-modal-size'
    // };
    const config: ModalOptions = { class: 'modal-dialog-centered modal-xl risk-modal-size', backdrop: true };
    let checkindata: any = JSON.parse(localStorage.getItem('checkindata'));
    let data: any = {};
    data['Einri'] = this.paramsObject.einri;
    data['Patnr'] = this.paramsObject.patnr;
    data['Falnr'] = this.paramsObject.falnr;
    data['Lfdnr'] = this.paramsObject.lfdnr;
    data['Patname'] = checkindata.PatientName;
    data['Datum'] = checkindata.AdmissionDate;
    this.modalRefForRisk = this.modalService.show(template, config);
    this.selectedERList = data;
    this.getRiskList(data);
    this.getRiskValues();
    this.isRiskUpdate = false;
    this.modalRefForRisk.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeRiskModal();
      }
    });
  }

  closeRiskModal() {
    this.modalRefForRisk.hide();
  }

  getRiskList(data) {
    const json = {
      einri: data.Einri,
      patnr: data.Patnr,
    };
    this.emergencyService.getRiskList(json).subscribe(
      (_success: any) => {
        this.riskList = [];
        this.riskList = _success.d.results;
        this.riskList.forEach((element) => {
          if (element.Repdt == '0000-00-00') {
            element['Repdt'] = '';
          } else {
            element['Repdt'] = new Date(element.Repdt);
          }
          this.addItemForRisk(element);
        });
      },
      (_error: any) => { }
    );
  }
  getRiskValues() {
    this.emergencyService.getRiskValues().subscribe(
      (_success: any) => {
        this.riskValues = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  addItemForRisk(element?): void {
    this.riskFormitems = this.riskform.get('riskFormitems') as FormArray;
    this.riskFormitems.push(this.showRiskDetailsOnList(element));
    this.disableInputs();
  }

  disableInputs() {
    (<FormArray>this.riskform.get('riskFormitems')).controls.forEach(
      (control) => {
        control['controls']['Rsfna'].disable();
        control['controls']['Rsfkb'].disable();
      }
    );
  }


  showRiskDetailsOnList(element?): FormGroup {
    if (element) {
      return this.fb.group({
        Rsfnr: [element.Rsfnr],
        Rsfna: [element.Rsfna],
        Rsfkb: [element.Rsfkb],
        Rsfsn: [element.Rsfsn],
        Repdt: [element.Repdt],
        Einri: [this.selectedERList.Einri],
        Patnr: [this.selectedERList.Patnr],
        Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [false],
      });
    } else {
      return this.fb.group({
        Rsfnr: [''],
        Rsfna: [''],
        Rsfkb: [''],
        Rsfsn: [''],
        Repdt: [''],
        Einri: [this.selectedERList.Einri],
        Patnr: [this.selectedERList.Patnr],
        Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [true],
      });
    }
  }
  searchString: any;
  allergenGroupValues: any;
  allergyCertaintyValues: any;
  allergyEvaluationValues: any;
  allergyReactionValues: any;
  severityValues: any;
  allergyTypeValues: any;
  openCommonModal(template: TemplateRef<any>, column) {
    const config: ModalOptions = { class: 'modal-dialog-centered' };
    this.modalRef = this.modalService.show(template, config);
    this.colName = column;
    if (column == 'Allergen') {
      this.modalCommonDataArr = this.allergenValues;
      this.searchString = this.updateAllergyForm.controls.Allergen.value;
      this.someMethod(this.searchString);
    }
    if (column == 'Allergen group') {
      this.modalCommonDataArr = this.allergenGroupValues;
    }
    if (column == 'Certainty') {
      this.modalCommonDataArr = this.allergyCertaintyValues;
    }
    if (column == 'Evaluation') {
      this.modalCommonDataArr = this.allergyEvaluationValues;
    }
    if (column == 'Allergic reaction') {
      this.modalCommonDataArr = this.allergyReactionValues;
    }
    if (column == 'Severity') {
      this.modalCommonDataArr = this.severityValues;
    }
    if (column == 'Allergy type') {
      this.modalCommonDataArr = this.allergyTypeValues;
    }
    if (column == 'Comments') {
      this.modalCommonDataArr = this.allergenValues;
    }
    if (column == 'RiskCode') {
      this.modalCommonDataArr = this.riskValues;
      this.searchString = this.updateRiskForm.controls.Rsfna.value;
      this.someMethod(this.searchString);
    }
  }

  someMethod(event: string) {
    if (this.modalCommonDataArr.length == 0) {
      if (this.colName == 'Allergen') {
        this.modalCommonDataArr = this.allergenValues;
      } else {
        this.modalCommonDataArr = this.riskValues;
      }
    } else {
      if (event == '') {
        if (this.colName == 'Allergen') {
          this.modalCommonDataArr = this.allergenValues;
        } else {
          this.modalCommonDataArr = this.riskValues;
        }
      } else {
        this.modalCommonDataArr = this.modalCommonDataArr.filter(
          (item: any) => {
            if (item.hasOwnProperty('Bcpname')) {
              return item.Bcpname.toLowerCase().includes(event.toLowerCase());
            } else {
              return item.Rsfna.toLowerCase().includes(event.toLowerCase());
            }
          }
        );
      }
    }
  }
  selectedDataForUpdate: any;
  riskJson: any = [];
  selectValueFromRiskTable(item) {
    this.isRiskUpdate = true;
    this.selectedDataForUpdate = item;
    this.updateRiskForm.controls.Rsfnr.setValue(item.Rsfnr);
    this.updateRiskForm.controls.Rsfna.setValue(item.Rsfna);
    this.updateRiskForm.controls.Rsfkb.setValue(item.Rsfkb);
    this.updateRiskForm.controls.Rsfsn.setValue(item.Rsfsn);
    this.updateRiskForm.controls.Repdt.setValue(item.Repdt);
  }


  confirmationForRiskDelete(status, item) {
    Swal.fire({
      text: 'Are you sure you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
    }).then((result) => {
      if (result.value) {
        this.deleteRiskJson(item);
      }
    });
  }

  deleteRiskJson(item) {
    this.riskJson = [];
    this.riskJson = [
      {
        Patnr: this.selectedERList.Patnr,
        Lfdnr: item.Lfdnr,
        Rsfnr: item.Rsfnr,
        Rsfna: item.Rsfna,
        Rsfkb: item.Rsfkb,
        Rsfsn: item.Rsfsn,
        Mode: 'D',
      },
    ];
    // this.saveRiskList();
  }

  selectedRiskList: any = [];
  importRiskFormat() {
    const formArray = this.riskform.get('riskFormitems') as FormArray;
    let fullData: any[] = formArray.getRawValue();
    console.log(fullData);
    console.log(this.riskform.value.riskFormitems,this.selectedRiskList,  "this.riskform.value.riskFormitems")
    let selectedData:any[] = fullData
      .filter(item => item.isChecked)
      .map((item, index) => ({
        Dockey: '',
        Id: (index + 1).toString().padStart(3, '0'), // "001", "002", etc.
        Desc: item.Rsfna || '',                     // Fallback to empty string if Desc is missing
        Code: item.Rsfnr
      }));
      selectedData.forEach((res: any, index) => {
        res.Id = (this.selectedRiskList.length + 1).toString().padStart(3, '0')
        this.selectedRiskList.push(res);
      })
      this.selectedRiskList.concat(selectedData);
      this.resetRiskForm();
      this.modalRefForRisk.hide();
  }

  saveRiskJsonFormat() {
    this.isFormValidError = true;
    this.riskJson = [];
    let mode = '';
    if (this.isRiskUpdate) {
      mode = 'U';
    } else {
      mode = 'I';
    }
    let finallfdnrValue;
    if (mode == 'I') {
      finallfdnrValue = '000';
    } else {
      finallfdnrValue = this.selectedDataForUpdate.Lfdnr;
    }
    let reportedon = '';
    if (this.updateRiskForm.controls.Repdt.value !== '') {
      reportedon =
        this.updateRiskForm.controls.Repdt.value.getDate() +
        '.' +
        this.updateRiskForm.controls.Repdt.value.getMonth(
          this.updateRiskForm.controls.Repdt.value.setMonth(
            this.updateRiskForm.controls.Repdt.value.getMonth() + 1
          )
        ) +
        '.' +
        this.updateRiskForm.controls.Repdt.value.getFullYear();
    }
    this.riskJson = [
      {
        Patnr: this.selectedERList.Patnr,
        Lfdnr: this.selectedERList.Lfdbw,
        Rsfnr: this.updateRiskForm.controls.Rsfnr.value,
        Rsfna: this.updateRiskForm.controls.Rsfna.value,
        Rsfkb: this.updateRiskForm.controls.Rsfkb.value,
        Rsfsn: this.updateRiskForm.controls.Rsfsn.value,
        Mode: mode,
      },
    ];
    if (this.updateRiskForm.controls.Repdt.value !== '') {
      const repdt = this.updateRiskForm.controls.Repdt.value;
      (reportedon =
        repdt.getFullYear() +
        '-' +
        String(repdt.getMonth()).padStart(2, '0') +
        '-' +
        String(repdt.getDate()).padStart(2, '0') +
        'T00:00:00'),
        (this.riskJson[0]['Repdt'] = reportedon);
    }
    this.saveRiskList();
  }
  saveRiskList() {
    if (this.riskJson[0]['Mode'] !== 'D') {
      if (this.updateRiskForm.controls.Rsfna.value == '') {
        Swal.fire({
          text: 'Risk Code is Mandatory',
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
      } else {
        const json = {
          Patnr: this.selectedERList.Patnr,
          PatRiskHdrToItmNav: {
            results: this.riskJson,
          },
        };
        this.emergencyService.saveRiskList(json).subscribe(
          (_success: any) => {
            this.resetRiskForm();
            this.resetUpdateRiskForm();
            this.getRiskList(this.selectedERList);
            Swal.fire({
              text: 'Saved successfully',
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: { popup: 'myalertpopup' },
            });
            this.isFormValidError = false;
          },
          (_error: any) => { }
        );
      }
    } else if (this.riskJson[0]['Mode'] == 'D') {
      const json = {
        Patnr: this.selectedERList.Patnr,
        PatRiskHdrToItmNav: {
          results: this.riskJson,
        },
      };
      this.emergencyService.saveRiskList(json).subscribe(
        (_success: any) => {
          this.resetRiskForm();
          this.resetUpdateRiskForm();
          this.getRiskList(this.selectedERList);
          Swal.fire({
            text: 'Deleted successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' },
          });
        },
        (_error: any) => { }
      );
    } else {
      const json = {
        Patnr: this.selectedERList.Patnr,
        PatRiskHdrToItmNav: {
          results: this.riskJson,
        },
      };
      this.emergencyService.saveRiskList(json).subscribe(
        (_success: any) => {
          this.resetRiskForm();
          this.resetUpdateRiskForm();
          this.getRiskList(this.selectedERList);
          Swal.fire({
            text: 'Saved successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' },
          });
        },
        (_error: any) => { }
      );
    }
  }
  riskItemsArr: any = []
  resetRiskForm() {
    this.riskFormitems = this.riskform.get('riskFormitems') as FormArray;
    this.riskform.reset();
    this.riskFormitems.clear();
    this.riskItemsArr = [];
  }

  resetUpdateRiskForm() {
    this.updateRiskForm.patchValue({
      Rsfnr: '',
      Rsfna: '',
      Rsfkb: '',
      Rsfsn: '',
      Repdt: '',
    });
    this.isRiskUpdate = false;
    this.isFormValidError = false;
  }


  selectValueFromList(item) {
    if (this.colName == 'Allergen') {
      this.updateAllergyForm.controls.Allergen.setValue(item.Bcpname);
      this.updateAllergyForm.controls.Allrgyid.setValue(item.Bcpid);
      this.updateAllergyForm.controls.Allrgycatlog.setValue(item.Bchid);
      this.updateAllergyForm.controls.AllergenGrp.setValue(item.BcpnameGroup);
      this.updateAllergyForm.controls.AllrgyidAgr.setValue(item.BcpidGroup);
      this.updateAllergyForm.controls.AllrgycatlogAgr.setValue(item.Bchid);
    }
    if (this.colName == 'Allergen group') {
      this.updateAllergyForm.controls.AllergenGrp.setValue(item.Bcpname);
      this.updateAllergyForm.controls.AllrgyidAgr.setValue(item.Bcpid);
      this.updateAllergyForm.controls.AllrgycatlogAgr.setValue(item.Bchid);
    }
    if (this.colName == 'Certainty') {
      this.updateAllergyForm.controls.CerText.setValue(item.CerText);
      this.updateAllergyForm.controls.Cert.setValue(item.Cer);
    }
    if (this.colName == 'Evaluation') {
      this.updateAllergyForm.controls.EvalTxt.setValue(item.EvalTxt);
      this.updateAllergyForm.controls.Eval.setValue(item.Eval);
    }
    if (this.colName == 'Allergic reaction') {
      this.updateAllergyForm.controls.ReaText.setValue(item.ReaText);
      this.updateAllergyForm.controls.Rea.setValue(item.Rea);
    }
    if (this.colName == 'Severity') {
      this.updateAllergyForm.controls.SoaText.setValue(item.SoaText);
      this.updateAllergyForm.controls.Soa.setValue(item.Soa);
    }
    if (this.colName == 'Allergy type') {
      this.updateAllergyForm.controls.TypText.setValue(item.TypText);
      this.updateAllergyForm.controls.Typ.setValue(item.Typ);
    }
    if (this.colName == 'Comments') {
      this.updateAllergyForm.controls.Adcomment.setValue(item.Adcomment);
      this.updateAllergyForm.controls.AdcommentLt.setValue(item.Adcomment);
    }
    if (this.colName == 'RiskCode') {
      this.updateRiskForm.controls.Rsfnr.setValue(item.Rsfnr);
      this.updateRiskForm.controls.Rsfna.setValue(item.Rsfna);
      this.updateRiskForm.controls.Rsfkb.setValue(item.Rsfkb);
    }
    this.modalRef.hide();
  }
}
