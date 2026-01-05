import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { PhysicianDiagnosisComponent } from './physician-diagnosis/physician-diagnosis.component';
import { PhysicianCreateAllergyComponent } from './physician-create-allergy/physician-create-allergy.component';
import { PhysicianErVitalsComponent } from './physician-er-vitals/physician-er-vitals.component';
import { DatePipe } from '@angular/common';
import { StorageService } from '@services/storage.service';
import { PhysicianPastMedicalComponent } from './physician-past-medical/physician-past-medical.component';
import { PhysicianPastSurgicalComponent } from './physician-past-surgical/physician-past-surgical.component';
import { PhysicianFamilyHistoryComponent } from './physician-family-history/physician-family-history.component';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AdmissionService } from '@services/admission/admission.service';
import Swal from 'sweetalert2';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { Subscription } from 'rxjs';
import { SharedService } from '@services/shared.service';
import { MedicationOrderTypeLabels } from '@services/interfaces/common.enum';

@Component({
  selector: 'app-physician-form',
  templateUrl: './physician-form.component.html',
  styleUrls: ['./physician-form.component.scss'],
})
export class PhysicianFormComponent implements OnInit {
  @Input() soapFormEvent: string;
  @Output() realodEducationList = new EventEmitter();
  @ViewChild('diagnosisNotesKardexId')
  diagnosisNotesKardex: PhysicianDiagnosisComponent;
  @ViewChild('createAllergyId')
  createAllergyId: PhysicianCreateAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: PhysicianErVitalsComponent;
  @ViewChild('pastMedicalKardexId')
  pastMedicalKardex: PhysicianPastMedicalComponent;
  @ViewChild('pastSurgicalKardexId')
  pastSurgicalKardex: PhysicianPastSurgicalComponent;
  @ViewChild('familyHistoryKardexId')
  familyHistoryKardex: PhysicianFamilyHistoryComponent;
  allergy: boolean = true;
  diagnosis: boolean = false;
  vitals: boolean = false;
  med: boolean = true;
  surg: boolean = false;
  family: boolean = false;
  skin: boolean = true;
  head: boolean = false;
  eyes: boolean = false;
  ENT: boolean = false;
  neck: boolean = false;
  breast: boolean = false;
  respiratoryCardiac: boolean = false;
  gastrointestinal: boolean = false;
  urinary: boolean = false;
  peripheralVascular: boolean = false;
  musculoskeletal: boolean = false;
  neurologic: boolean = false;
  hematologic: boolean = false;
  endocrine: boolean = false;
  psychiatric: boolean = false;
  modalRefUpdateName: BsModalRef;
  physicianForm: FormGroup;
  generalPhyExamForm: FormGroup;
  headNeckPhyExamForm: FormGroup;
  eyesPhyExamForm: FormGroup;
  entPhyExamForm: FormGroup;
  respiratoryPhyExamForm: FormGroup;
  cardioPhyExamForm: FormGroup;
  haemaPhyExamForm: FormGroup;
  gastroPhyExamForm: FormGroup;
  musculoPhyExamForm: FormGroup;
  skinPhyExamForm: FormGroup;
  neuroPhyExamForm: FormGroup;
  genitPhyExamForm: FormGroup;
  breastPhyExamForm: FormGroup;
  toPhyExamArr = [];
  toAllergyArr: any = [];
  toVitalsArr: any = [];
  toDiagnosisArr: any = [];
  toPastMedical: any = [];
  toPastSurgical: any = [];
  toFamilyHistory: any[] = [];
  longComment = '';
  formName: any;
  modalRefForComment: BsModalRef;
  duplicates = [];
  enableCreateDiagnosis = false;
  enableCreateVitals = false;
  Problem: boolean = true;
  Initial: boolean = false;
  Risk: boolean = false;

  drugArray: any[] = [];
  medicationImportDrugArray: any[] = [];
  selectedMedicationOrder: any[] = [];
  enableCreatePMed: boolean = false;
  enableCreatePSurg: boolean = false;
  enableCreateFamily: boolean;

  orderType = MedicationOrderTypeLabels;

  constructor(
    public modalService: BsModalService,
    public storageService: StorageService,
    private formBuilder: FormBuilder,
    private admissionService: AdmissionService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    public ePrescriptionService: EPrescriptionService,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initPhyExamForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.soapFormEvent.currentValue == 'add') {
      this.createPhysicianForm(false);
    }
    if (changes.soapFormEvent.currentValue == 'edit') {
      this.updatePhysicianForm();
    }

    if (changes.soapFormEvent.currentValue == 'saveClose') {
      if (this.admissionService.isEditPhysicianForm) {
        this.updatePhysicianForm();
      } else {
        this.createPhysicianForm(false);
      }
    }
    if (changes.soapFormEvent.currentValue == 'release') {
      if (this.admissionService.isEditPhysicianForm) {
        this.releasePhysicianDoc();
      } else {
        this.createPhysicianForm(true);
      }
    }

    if (
      this.admissionService.isEditPhysicianForm ||
      this.admissionService.isClonePhysicianForm
    ) {
      this.getPhysicianData();
    }
  }

  initForm() {
    this.physicianForm = this.formBuilder.group({
      Dockey: [''],
      Dtid: ['ZMED_PHASM'],
      Einri: [this.storageService.einri],
      Patnr: [this.storageService.patnr],
      Falnr: [this.storageService.falnr],
      Lfdnr: [this.storageService.lfdnr],
      Orgdo: [''],
      PhyAssdate: [
        new Date(
          `${new DatePipe('en-US').transform(
            new Date(),
            'yyyy-MM-dd'
          )}T00:00:00`
        ),
      ],
      PhyAsstime: [this.datePipe.transform(new Date(), 'hh:mm')],
      ChiefComplaint: [''],
      Appetite: [''],
      AppetiteT: [''],
      BowelMovements: [''],
      BowelMovementsT: [''],
      Micturition: [''],
      MicturitionT: [''],
      Smoking: [''],
      CigattDay: [''],
      SDuration: [''],
      SmokingCounseling: false,
      AlcoholIntake: [''],
      GlassWeek: [''],
      GlassDay: [''],
      ADuration: [''],
      Comments: [''],
      SNoReportedAbnorm: [false],
      SRashes: [false],
      STypeRash: [''],
      SItching: [false],
      SChangeHairNails: [false],
      SComments: [''],
      HNoReportedAbnorm: [false],
      HHeadInjury: [false],
      HHeadCircumference: ['0.00'],
      HComments: [''],
      ENoReportedAbnorm: [false],
      EGlassesContacts: [false],
      EChangeVision: [false],
      EEyePain: [false],
      EDoubleVision: [false],
      EFlashingLights: [false],
      EGlaucomaCataracts: [false],
      ELastEyeExam: [false],
      EComments: [''],
      EneNoReportedAbnorma: [false],
      EneChangeHearing: [false],
      EneTympanicMembrane: [false],
      EneEarDischarge: [false],
      EneRinging: [false],
      EneDizziness: [false],
      EnnNoReportedAbnorm: [false],
      EnnNoseBleeds: [false],
      EnnNasalStuffiness: [false],
      EnnFrequentColds: [false],
      EnnNasalFlaring: [false],
      EnmNoReportedAbnorm: [false],
      EnmBleedingGums: [false],
      EnmSoreTongue: [false],
      EnmHoarseness: false,
      EnmLipColor: [''],
      EnmComments: [''],
      NNoReportedAbnorm: [false],
      NLumps: [false],
      NSwollenGlands: [false],
      NGoiter: [false],
      NStiffness: [false],
      NComments: [''],
      BNoReportedAbnorm: [false],
      BLumps: [false],
      BPain: [false],
      BNippleDischarge: [false],
      BSkinAbnormalities: [false],
      BComments: [''],
      RNoReportedAbnorm: [false],
      RShortnessBreath: [false],
      RCough: [false],
      RWheezing: [false],
      RCoughingBlood: [false],
      RProductionPhlegm: [false],
      RChestPain: [false],
      RFever: [false],
      RNightSweats: [false],
      RBlueFingersToes: [false],
      RSwellingHandsFeet: [false],
      RBronchitisEmphysema: [false],
      RHeartMurmur: [false],
      RHxHeartMedication: [false],
      RSkippingHeartBeats: [false],
      RComments: [''],
      GNoReportedAbnorm: [false],
      GChangeAppetiteWeight: [false],
      GProblemsSwallowing: [false],
      GNausea: [false],
      GHeartburn: [false],
      GVomiting: [false],
      GVomitingBlood: [false],
      GConstipation: [false],
      GDiarrhea: [false],
      GChangeBowelHabits: [false],
      GAbdominalPain: [false],
      GExcessiveBelching: [false],
      GExcessiveFlatus: [false],
      GYellowColourSkin: [false],
      GFoodIntolerance: [false],
      GRectalBleedingHemo: [false],
      GToiletTrained: [false],
      GTfreq: [''],
      GUsesDiaper: [false],
      GUfreq: [''],
      GComments: [''],
      UNoReportedAbnorm: [false],
      UDifficultyUrination: [false],
      UPainBurningUrination: [false],
      UFrequentUrinationNight: [false],
      UUrgentNeedUrinate: [false],
      UIncontinenceUrine: [false],
      UDribbling: [false],
      UDecreasedUrineStream: [false],
      UBloodUrine: [false],
      UUtiStonesProstate: [false],
      UComments: [''],
      PNoReportedAbnorm: [false],
      PLegCramps: [false],
      PVaricoseVeins: [false],
      PClotsVeins: [false],
      PComments: [''],
      MNoReportedAbnorm: [false],
      MPain: [false],
      MSwelling: [false],
      MStiffness: [false],
      MDecreasedJointMotion: [false],
      MBrokenBone: [false],
      MSeriousSprains: [false],
      MArthritis: [false],
      MGout: [false],
      MComments: [''],
      NuNoReportedAbnorm: [false],
      NuHeadaches: [false],
      NuSeizures: [false],
      NuLossConsciousness: [false],
      NuParalysis: [false],
      NuWeakness: [false],
      NuLossMuscleSize: [false],
      NuMuscleSpasm: [false],
      NuTremor: [false],
      NuInvoluntaryMovement: [false],
      NuIncoordination: [false],
      NuNumbness: [false],
      NuFeelingPinsNeedles: [false],
      NuComments: [''],
      HeNoReportedAbnorm: [false],
      HeAnemia: [false],
      HeEasyBruisingBleeding: [false],
      HeComments: [''],
      EdNoReportedAbnorm: [false],
      EdAbnormalGrowth: [false],
      EdIncreasedAppetite: [false],
      EdIncreasedThirst: [false],
      EdIncreaseUrineProduction: [false],
      EdThyroidTrouble: [false],
      EdHeatColdIntolerance: [false],
      EdExcessingSweating: [false],
      EdDiabetes: [false],
      EdComments: [''],
      PsNoReportedAbnorm: [false],
      PsTensionAnxiety: [false],
      PsDepressionSuicide: [false],
      PsMemoryProblems: [false],
      PsUnusualProblems: [false],
      PsSleepProblems: [false],
      PsPastTreatmentPsychiatri: [false],
      PsChangeMood: [false],
      PsComments: [''],
      GynThyroids: [''],
      GynAbdomen: [''],
      GynBreasts: [''],
      GynPelvic: [''],
      GynVulva: [''],
      GynVagina: [''],
      GynCervix: [''],
      GynUterus: [''],
      GynForceps: [''],
      GynSpeculum: [''],
      GynComments: [''],
      Spiritual: [''],
      Cultural: [''],
      ScComments: [''],
      ImComment: [''],
      LengthStay: [''],
      PSelfLimited: [''],
      PStableProblem: [''],
      PNotControlled: [''],
      PAdditionalWorkUp: [''],
      PNoAdditionalWorkUp: [''],
      ILabTests: [false],
      IRadiologyTests: [false],
      IOtherTests: [false],
      IDiscussResults: [false],
      IReviewImage: [false],
      IObtainOlderRecords: [false],
      IReviewSummOldRecrd: [false],
      MirOneImitedPrbm: [false],
      LorTwoImitedPrbm: [false],
      LorOneStableChronic: [false],
      LorAcuteUncomplicated: [false],
      LorOtcDrugs: [false],
      MorMildExacerbation: [false],
      MorTwoStableChronic: [false],
      MorUndiagnosedNewPrbm: [false],
      MorAcuteIllness: [false],
      MorPrescriptionDrug: [false],
      MorElectiveMajorSurgery: [false],
      MorMinorSurgery: [false],
      MorClosedFx: [false],
      MorCardiacEpTest: [false],
      MorDeepBiopsy: [false],
      HrSevereExacerbation: [false],
      HrIllness: false,
      HrAbrupt: false,
      HrParenteral: false,
      HrDecision: false,
      HrDrugs: false,
      AttendPhy: [this.storageService.getGpart()],
      DocStatus: [''],
      TOALLERGIES: [[]],
      TODIAGNOSES: [[]],
      TOVITALSIGNS: [[]],
      TOLAB: [[]],
      TORAD: [[]],
      TOPMEDCOND: [[]],
      TOFAMILYHIST: [[]],
      TOOBSEXAM: [[]],
      TOPHYEXAM: [[]],
      TOPSURGERIHIST: [[]],
      NaVitalSigns: [false],
      NaDiagnosis: [false],
      CannotAssessedReview: [false],
      NoMedicalHistory: [false],
      NoSurgeryHistory: [false],
      NoFamilyHistory: [false]
    });
  }

  initPhyExamForm() {
    this.generalPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['General'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.headNeckPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Head and Neck'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.eyesPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Eyes'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.entPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['ENT'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.respiratoryPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Respiratory'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.cardioPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Cardiovascular'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.haemaPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Haematology'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.gastroPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Gastrointestinal'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.musculoPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Musculoskeletal'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.skinPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Skin'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.neuroPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Neurologic'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.genitPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Genitourinary'],
      PhyMode: [''],
      PhyComments: [''],
    });
    this.breastPhyExamForm = this.formBuilder.group({
      Dockey: [''],
      PhyDescription: ['Breast'],
      PhyMode: [''],
      PhyComments: [''],
    });
  }
  toPhyExamResponse() {
    // this.toPhyExamArr = [];
    let sendPhyExamArr = [];
    if (this.generalPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.generalPhyExamForm.value);
    }
    if (this.headNeckPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.headNeckPhyExamForm.value);
    }
    if (this.eyesPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.eyesPhyExamForm.value);
    }
    if (this.entPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.entPhyExamForm.value);
    }
    if (this.respiratoryPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.respiratoryPhyExamForm.value);
    }
    if (this.cardioPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.cardioPhyExamForm.value);
    }
    if (this.haemaPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.haemaPhyExamForm.value);
    }
    if (this.gastroPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.gastroPhyExamForm.value);
    }
    if (this.musculoPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.musculoPhyExamForm.value);
    }
    if (this.skinPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.skinPhyExamForm.value);
    }
    if (this.neuroPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.neuroPhyExamForm.value);
    }
    if (this.genitPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.genitPhyExamForm.value);
    }
    if (this.breastPhyExamForm.value.PhyMode != '') {
      sendPhyExamArr.push(this.breastPhyExamForm.value);
    }
    return sendPhyExamArr;
  }
  setValuesForPhyExam() {
    this.toPhyExamArr.forEach((element) => {
      if (element.PhyDescription == 'General') {
        this.generalPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.generalPhyExamForm.controls.PhyComments.setValue(
          element.PhyComments
        );
      }
      if (element.PhyDescription == 'Head and Neck') {
        this.headNeckPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.headNeckPhyExamForm.controls.PhyComments.setValue(
          element.PhyComments
        );
      }
      if (element.PhyDescription == 'Eyes') {
        this.eyesPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.eyesPhyExamForm.controls.PhyComments.setValue(element.PhyComments);
      }
      if (element.PhyDescription == 'ENT') {
        this.entPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.entPhyExamForm.controls.PhyComments.setValue(element.PhyComments);
      }
      if (element.PhyDescription == 'Respiratory') {
        this.respiratoryPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.respiratoryPhyExamForm.controls.PhyComments.setValue(
          element.PhyComments
        );
      }
      if (element.PhyDescription == 'Cardiovascular') {
        this.cardioPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.cardioPhyExamForm.controls.PhyComments.setValue(
          element.PhyComments
        );
      }
      if (element.PhyDescription == 'Haematology') {
        this.haemaPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.haemaPhyExamForm.controls.PhyComments.setValue(
          element.PhyComments
        );
      }
      if (element.PhyDescription == 'Gastrointestinal') {
        this.gastroPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.gastroPhyExamForm.controls.PhyComments.setValue(
          element.PhyComments
        );
      }
      if (element.PhyDescription == 'Musculoskeletal') {
        this.musculoPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.musculoPhyExamForm.controls.PhyComments.setValue(
          element.PhyComments
        );
      }
      if (element.PhyDescription == 'Skin') {
        this.skinPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.skinPhyExamForm.controls.PhyComments.setValue(element.PhyComments);
      }
      if (element.PhyDescription == 'Neurologic') {
        this.neuroPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.neuroPhyExamForm.controls.PhyComments.setValue(
          element.PhyComments
        );
      }
      if (element.PhyDescription == 'Genitourinary') {
        this.genitPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.genitPhyExamForm.controls.PhyComments.setValue(
          element.PhyComments
        );
      }
      if (element.PhyDescription == 'Breast') {
        this.breastPhyExamForm.controls.PhyMode.setValue(element.PhyMode);
        this.breastPhyExamForm.controls.PhyComments.setValue(
          element.PhyComments
        );
      }
    });
  }

  getPhysicianData() {
    let json = {
      Dockey: this.admissionService.selectedCurrentDocDetails.Dockey,
    };
    this.admissionService.getPhysicianData(json).subscribe((patientResult) => {
      this.toAllergyArr = patientResult?.results[0].TOALLERGIES?.results;
      this.toVitalsArr = patientResult?.results[0].TOVITALSIGNS?.results;
      this.toDiagnosisArr = patientResult?.results[0].TODIAGNOSES?.results;
      this.toPhyExamArr = patientResult?.results[0].TOPHYEXAM?.results;
      this.toPastMedical = patientResult?.results[0].TOPMEDCOND?.results;
      this.toPastSurgical = patientResult?.results[0].TOPSURGERIHIST?.results;
      this.medicationImportDrugArray = patientResult?.results[0].TOMEDICATION?.results;
      this.toFamilyHistory = patientResult?.results[0].TOFAMILYHIST?.results;
      this.physicianForm.patchValue(patientResult?.results[0]);
      this.physicianForm.patchValue({
        Dockey: patientResult?.results[0]?.Dockey,
        PhyAssdate: this.getDate(patientResult?.results[0]?.PhyAssdate),
        PhyAsstime: this.getTime(patientResult?.results[0]?.PhyAsstime),
      });
      this.setValuesForPhyExam();
      this.handleCheckboxDiagnosis();
      this.handleCheckboxVitals();
      this.handleCheckboxPastMed();
      this.handleCheckboxPastSurg();
      this.handleCheckboxFamilyHist();
      if (this.physicianForm.controls.CannotAssessedReview.value) {
        this.handleCheckboxCannotBeAccess({ checked: true });
      } else {
        if (this.physicianForm.value.SNoReportedAbnorm) {
          this.handleCheckboxSkinCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.HNoReportedAbnorm) {
          this.handleCheckboxHeadCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.ENoReportedAbnorm) {
          this.handleCheckboxEyeCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.EneNoReportedAbnorma) {
          this.handleCheckboxEneCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.NNoReportedAbnorm) {
          this.handleCheckboxNeckCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.BNoReportedAbnorm) {
          this.handleCheckboxBreastCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.RNoReportedAbnorm) {
          this.handleCheckboxResCardiacCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.GNoReportedAbnorm) {
          this.handleCheckboxGastroCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.UNoReportedAbnorm) {
          this.handleCheckboxUrinaryCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.PNoReportedAbnorm) {
          this.handleCheckboxPeriCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.MNoReportedAbnorm) {
          this.handleCheckboxMusculCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.NuNoReportedAbnorm) {
          this.handleCheckboxNeuroCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.HNoReportedAbnorm) {
          this.handleCheckboxHemaCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.EdNoReportedAbnorm) {
          this.handleCheckboxEndoCannotBeAccess({ checked: true });
        }
        if (this.physicianForm.value.PNoReportedAbnorm) {
          this.handleCheckboxPsyCannotBeAccess({ checked: true });
        }
      }
      this.toPastMedical.forEach(element => {
        element['Ddate'] = `${new DatePipe('en-US').transform(
          this.getDate(element.Ddate),
          'yyyy-MM-dd'
        )}T00:00:00`
      });
      this.toPastSurgical.forEach(element => {
        element['Sdate'] = `${new DatePipe('en-US').transform(
          this.getDate(element.Sdate),
          'yyyy-MM-dd'
        )}T00:00:00`
      });
    });
  }

  onDateChange(event: any) { }
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

  switchTabsForReviewSystems(tab) {
    this.skin = false;
    this.head = false;
    this.eyes = false;
    this.ENT = false;
    this.neck = false;
    this.breast = false;
    this.respiratoryCardiac = false;
    this.gastrointestinal = false;
    this.urinary = false;
    this.peripheralVascular = false;
    this.musculoskeletal = false;
    this.neurologic = false;
    this.hematologic = false;
    this.endocrine = false;
    this.psychiatric = false;
    this[tab] = true;
  }

  openModal(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class:
        'modal-dialog modal-dialog-centered medication-order-case modal-xl',
    };
    this.modalRefUpdateName = this.modalService.show(template, config);
    this.loadMedicationHistoryData();
    // this.medicationImportDrugArray=[];
  }

  openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
  }
  openModalForDiagnosis() {
    this.diagnosisNotesKardex.openModalForDiagnosisKardex();
  }
  openModalVital() {
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
      customClass: { popup: 'myalertpopup' },
    });
  }

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
  importMedicalHistory(data) {
    data.forEach((el) => {
      this.toFamilyHistory = this.toFamilyHistory.concat(el);
      // this.toFamilyHistory = this.toFamilyHistory.concat({
      //   Dockey: "",
      //   Problem: el.problemName,
      //   Father: el.father,
      //   Mother: el.mother,
      //   Brother: el.brother,
      //   Sister: el.sister,
      //   Paternal: el.paternal,
      //   Maternal: el.maternal,
      //   Son: el.son,
      //   Remarks: el.comment
      // });
    });
    console.log(this.toFamilyHistory)
    this.duplicates = [];
    this.duplicates = this.findDuplicatesPastFamliye();
    this.toFamilyHistory = this.toFamilyHistory.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Problem === value.Problem)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesPastFamliye();
    }
  }

  findDuplicatesPastFamliye() {
    let tempArr = [];
    const lookup = this.toFamilyHistory.reduce((a, e) => {
      a[e.Problem] = ++a[e.Problem] || 0;
      return a;
    }, {});
    tempArr = this.toFamilyHistory.filter((e) => lookup[e.Problem]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Problem === value.Problem)
    );
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

  errorMsgForDuplicatesPastFamliye() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.Problem);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' },
    });
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
      customClass: { popup: 'myalertpopup' },
    });
  }

  deleteFromTable(item, index) {
    this.toAllergyArr.splice(index, 1);
    console.log(this.toAllergyArr);
  }
  deleteVitalsFromTable(item, index) {
    this.toVitalsArr.splice(index, 1);
  }
  deleteDiagnosisFromTable(item, index) {
    this.toDiagnosisArr.splice(index, 1);
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
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }

  async createPhysicianForm(isrelease: boolean) {
    let createJson = { ...this.physicianForm.value };

    if (createJson["Dockey"] === null || createJson["Dockey"] === undefined || createJson["Dockey"] === "") {
      if (isrelease) {
        createJson['DocStatus'] = '4';
      } else {
        createJson['DocStatus'] = '1';
      }
    } else {

      if (this.admissionService.isClonePhysicianForm && isrelease) {
        createJson['DocStatus'] = '5';
      }
      if (this.admissionService.isClonePhysicianForm && !isrelease) {
        createJson['DocStatus'] = '3';
      }
      if (this.admissionService.isEditPhysicianForm && isrelease) {
        createJson['DocStatus'] = '5';
      }
      if (this.admissionService.isEditPhysicianForm && !isrelease) {
        createJson['DocStatus'] = '3';
      }

    }

    if (createJson.PhyAssdate != '') {
      createJson.PhyAssdate = `${new DatePipe('en-US').transform(
        createJson.PhyAssdate,
        'yyyy-MM-dd'
      )}T00:00:00`;
    }
    let createtime = '';
    if (createJson.PhyAsstime != '') {
      createtime = createJson.PhyAsstime.split(':');
      createJson.PhyAsstime =
        'PT' + createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    }
    createJson['TOALLERGIES'] = this.toAllergyArr;
    createJson['TOVITALSIGNS'] = this.toVitalsArr;
    createJson['TODIAGNOSES'] = this.toDiagnosisArr;
    createJson['TOPHYEXAM'] = this.toPhyExamResponse();
    createJson['TOPMEDCOND'] = this.toPastMedical;
    createJson['TOPSURGERIHIST'] = this.toPastSurgical;
    createJson['TOMEDICATION'] = this.medicationImportDrugArray;
    createJson['TOFAMILYHIST'] = this.toFamilyHistory;
    await this.admissionService
      .createPhysicianData(createJson)
      .subscribe(() => {
        // if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
        // }
        this.admissionService.cancelAllForm();
        const message = createJson.DocStatus == '2' ? 'Physician Assessment Release Successfully' : 'Physician Assessment Create Successfully'
        this.sharedService.successSwallModel(message)
        this.admissionService.selectedCurrentDocDetails = '';
        this.realodEducationList.next(true);
        this.admissionService.clearSoapEvent.next(true);
        this.admissionService.isClonePhysicianForm = false;
        this.admissionService.isEditPhysicianForm = false;
      }, (error) => {
        this.admissionService.isClonePhysicianForm = false;
        this.admissionService.isEditPhysicianForm = false;
        this.admissionService.clearSoapEvent.next(true);
        const errorMsg = error?.error?.error?.message?.value || 'Unknown error';
        this.sharedService.waringSwallModel(`${errorMsg}`);
      });
  }
  toPhyExamItems() {
    return this.physicianForm.value.TOPHYEXAM.results.filter(
      (el) => el.PhyMode != null
    );
  }

  openCommentBox(template: TemplateRef<any>, form) {
    this.formName = form;
    const config: ModalOptions = {
      class: 'modal-dialog additional-info-temp',
    };
    this.modalRefForComment = this.modalService.show(template, config);
    this.fillCommentBox(this.formName);
  }
  fillCommentBox(form) {
    this.formName = form;
    if (this.formName == 'generalPhyExamForm') {
      if (this.generalPhyExamForm.controls.PhyMode.value == '0') {
        if (this.generalPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'No Distress, lying in bed, not jaundiced, not cyanosed,  alert,conscious, oriented to person, place & time.';
          this.generalPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment = this.generalPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.generalPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'headNeckPhyExamForm') {
      if (this.headNeckPhyExamForm.controls.PhyMode.value == '0') {
        if (this.headNeckPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'No head and neck injury, no lesions, intact sensation, no facial weakness or paralysis, no thyroid nodules, no abnormal lymph nodes. No Jugular venous distension (JVD).';

          this.headNeckPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment =
            this.headNeckPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.headNeckPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'eyesPhyExamForm') {
      if (this.eyesPhyExamForm.controls.PhyMode.value == '0') {
        if (this.eyesPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Conjunctiva and sclera are anicteric pupils equally round and reactive to light and accommodation bilaterally. No ptosis. The extraocular movements are intact.';

          this.eyesPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.eyesPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.eyesPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'entPhyExamForm') {
      if (this.entPhyExamForm.controls.PhyMode.value == '0') {
        if (this.entPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Denies hearing loss, ringing in ears, or lesions. Oropharynx: Normal.No oral lesions. Neck: No lymphadenopathy. Trachea is midline. No thyroid masses.';

          this.entPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.entPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.entPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'respiratoryPhyExamForm') {
      if (this.respiratoryPhyExamForm.controls.PhyMode.value == '0') {
        if (this.respiratoryPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Good Air Entry bilateral, normal vesicular breathing, no added sounds.Normal chest expansion and percussion notes, no skin lesions.';

          this.respiratoryPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment =
            this.respiratoryPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.respiratoryPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'cardioPhyExamForm') {
      if (this.cardioPhyExamForm.controls.PhyMode.value == '0') {
        if (this.cardioPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Regular rhythm, S1 and S2 are normal, no murmurs or added sounds.Peripheral pulses are present, normal & intact.';

          this.cardioPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment = this.cardioPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.cardioPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'haemaPhyExamForm') {
      if (this.haemaPhyExamForm.controls.PhyMode.value == '0') {
        if (this.haemaPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'No neck, axillary or inguinal lymphadenopathy. No skin discoloration or subdermal or subcutaneous bleeding';

          this.haemaPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.haemaPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.haemaPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'gastroPhyExamForm') {
      if (this.gastroPhyExamForm.controls.PhyMode.value == '0') {
        if (this.gastroPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Soft & lax abdomen, non-tender and non-distended. No guarding rebound or rigidity. No distention. Bowel sounds are normal. No suprapubic tenderness. No bruit. No hepatosplenomegaly. No skin lesion or palpable superficial masses. Normal umbilicus position.';

          this.gastroPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment = this.gastroPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.gastroPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'musculoPhyExamForm') {
      if (this.musculoPhyExamForm.controls.PhyMode.value == '0') {
        if (this.musculoPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Normal range of motion, no joint swelling or erythema. No cyanosis/clubbing/or edema.';

          this.musculoPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment = this.musculoPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.musculoPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'skinPhyExamForm') {
      if (this.skinPhyExamForm.controls.PhyMode.value == '0') {
        if (this.skinPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Intact, no rashes, no lesions, no erythema, no abnormal colours,normal nails texture and colour.';

          this.skinPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.skinPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.skinPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'neuroPhyExamForm') {
      if (this.neuroPhyExamForm.controls.PhyMode.value == '0') {
        if (this.neuroPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Cranial nerves II-XII are intact. Deep tendon reflexes are normal.Power is 5/5. No abnormal movements.';

          this.neuroPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.neuroPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.neuroPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'genitPhyExamForm') {
      if (this.genitPhyExamForm.controls.PhyMode.value == '0') {
        if (this.genitPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Male: Normal urethral orifice, location and size, no skin lesions or ulcers, normal colour, no abnormal secretions.Female: No gross masses or skin lesions, no discharge, no prolapses.';

          this.genitPhyExamForm.controls.PhyComments.setValue(this.longComment);
        } else {
          this.longComment = this.genitPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.genitPhyExamForm.controls.PhyComments.setValue('');
      }
    }
    if (this.formName == 'breastPhyExamForm') {
      if (this.breastPhyExamForm.controls.PhyMode.value == '0') {
        if (this.breastPhyExamForm.controls.PhyComments.value == '') {
          this.longComment =
            'Symmetrical size and shape, no masses, lumps, nipple intact, no discharges, no skin changes or discoloration.';

          this.breastPhyExamForm.controls.PhyComments.setValue(
            this.longComment
          );
        } else {
          this.longComment = this.breastPhyExamForm.controls.PhyComments.value;
        }
      } else {
        this.longComment = '';
        this.breastPhyExamForm.controls.PhyComments.setValue('');
      }
    }
  }
  closeCommentBox() {
    this.modalRefForComment.hide();
    this.longComment = '';
  }
  saveComment() {
    if (this.formName == 'generalPhyExamForm') {
      this.generalPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'headNeckPhyExamForm') {
      this.headNeckPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'eyesPhyExamForm') {
      this.eyesPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'entPhyExamForm') {
      this.entPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'respiratoryPhyExamForm') {
      this.respiratoryPhyExamForm.controls.PhyComments.setValue(
        this.longComment
      );
    }
    if (this.formName == 'cardioPhyExamForm') {
      this.cardioPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'haemaPhyExamForm') {
      this.haemaPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'gastroPhyExamForm') {
      this.gastroPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'musculoPhyExamForm') {
      this.musculoPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'skinPhyExamForm') {
      this.skinPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'neuroPhyExamForm') {
      this.neuroPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'skinPhyExamForm') {
      this.skinPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    if (this.formName == 'breastPhyExamForm') {
      this.breastPhyExamForm.controls.PhyComments.setValue(this.longComment);
    }
    this.modalRefForComment.hide();
  }

  async updatePhysicianForm() {
    let updateJson = { ...this.physicianForm.value };
    let createtime = '';
    if (updateJson.PhyAssdate != '') {
      updateJson.PhyAssdate = `${new DatePipe('en-US').transform(
        updateJson.PhyAssdate,
        'yyyy-MM-dd'
      )}T00:00:00`;
    }
    if (updateJson.PhyAsstime != '') {
      createtime = updateJson.PhyAsstime.split(':');
      updateJson.PhyAsstime =
        'PT' + createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    }
    updateJson['DocStatus'] = '1';
    updateJson['TOALLERGIES'] = this.toAllergyArr;
    updateJson['TOVITALSIGNS'] = this.toVitalsArr;
    updateJson['TOPHYEXAM'] = this.toPhyExamResponse();
    updateJson['TODIAGNOSES'] = this.toDiagnosisArr;
    updateJson['TOPMEDCOND'] = this.toPastMedical;
    updateJson['TOPSURGERIHIST'] = this.toPastSurgical;
    updateJson['TOMEDICATION'] = this.medicationImportDrugArray;
    updateJson['TOFAMILYHIST'] = this.toFamilyHistory;
    await this.admissionService
      .updatePhysicianData(updateJson)
      .subscribe(() => {
        //  if(this.soapFormEvent == 'saveClose' || this.soapFormEvent == 'release') { 
        // }
        this.admissionService.cancelAllForm();
        const message = updateJson.DocStatus == '2' ? 'Physician Assessment Release Successfully' : 'Physician Assessment Create Successfully'
        this.sharedService.successSwallModel(message)
        this.admissionService.selectedCurrentDocDetails = '';
        this.realodEducationList.next(true);
        this.admissionService.clearSoapEvent.next(true);
        this.admissionService.isClonePhysicianForm = false;
        this.admissionService.isEditPhysicianForm = false;
      }, (error) => {
        this.admissionService.isClonePhysicianForm = false;
        this.admissionService.isEditPhysicianForm = false;
        this.admissionService.clearSoapEvent.next(true);
        const errorMsg = error?.error?.error?.message?.value || 'Unknown error';
        this.sharedService.waringSwallModel(`${errorMsg}`);
      });
  }
  async releasePhysicianDoc() {
    let updateJson = { ...this.physicianForm.value };
    let createtime = '';
    updateJson['DocStatus'] = '2';
    if (updateJson.PhyAssdate != '') {
      updateJson['PhyAssdate'] = `${new DatePipe('en-US').transform(
        updateJson.PhyAssdate,
        'yyyy-MM-dd'
      )}T00:00:00`;
    }
    if (updateJson.PhyAsstime != '') {
      createtime = updateJson.PhyAsstime.split(':');
      updateJson.PhyAsstime =
        'PT' + createtime[0] + 'H' + createtime[1] + 'M' + '00S';
    }
    updateJson['TOALLERGIES'] = this.toAllergyArr;
    updateJson['TOVITALSIGNS'] = this.toVitalsArr;
    updateJson['TOPHYEXAM'] = this.physicianForm.value.TOPHYEXAM.results;
    updateJson['TODIAGNOSES'] = this.toDiagnosisArr;
    updateJson['TOPMEDCOND'] = this.toPastMedical;
    updateJson['TOPSURGERIHIST'] = this.toPastSurgical;
    updateJson['TOFAMILYHIST'] = this.toFamilyHistory;
    updateJson['TOMEDICATION'] = this.medicationImportDrugArray;
    this.admissionService.releasePhysicianDoc(updateJson).subscribe(() => {
      this.admissionService.cancelAllForm();
      this.sharedService.successSwallModel('Physician Assessment Release Successfully')
      this.admissionService.selectedCurrentDocDetails = '';
      this.admissionService.clearSoapEvent.next(true);
      this.realodEducationList.next(true);
    });
  }

  handleCheckboxSkinCannotBeAccess(assess) {
    const fields = ['SRashes', 'SItching', 'SChangeHairNails'];

    fields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (assess.checked) {
          control.setValue(false); // or control.reset() if you prefer to clear all types
          control.disable();
        } else {
          control.enable();
        }
      }
    });
    this.physicianForm.get('STypeRash').setValue("");
  }

  handleCheckboxHeadCannotBeAccess(assess) {
    const fields = ['HHeadInjury'];

    fields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (assess.checked) {
          control.setValue(false);      // Or setValue(false) if it's a checkbox
          control.disable();
        } else {
          control.enable();
        }
      }
    });
    this.physicianForm.get('HHeadCircumference').setValue("0.00");

  }

  handleCheckboxEyeCannotBeAccess(assess) {
    const fields = [
      'EGlassesContacts',
      'EChangeVision',
      'EEyePain',
      'EDoubleVision',
      'EFlashingLights',
      'EGlaucomaCataracts',
      'ELastEyeExam'
    ];

    fields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (assess.checked) {
          control.setValue(false);      // or control.setValue(false) for checkboxes
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }
  handleCheckboxEneCannotBeAccess(assess) {
    const fields = [
      'EneChangeHearing',
      'EneTympanicMembrane',
      'EneEarDischarge',
      'EneRinging',
      'EneDizziness'
    ];

    fields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (assess.checked) {
          control.setValue(false); // Or setValue(false) for checkboxes
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }
  handleCheckboxEnnCannotBeAccess(assess) {
    const fields = [
      'EnnNoseBleeds',
      'EnnNasalStuffiness',
      'EnnNasalFlaring',
      'EnnFrequentColds'
    ];

    fields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (assess.checked) {
          control.setValue(false); // or control.setValue(false) for checkboxes
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }
  handleCheckboxEnmCannotBeAccess(assess) {
    const fields = [
      'EnmBleedingGums',
      'EnmSoreTongue',
    ];

    fields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (assess.checked) {
          control.setValue(false);  // Or use control.setValue(false) for checkboxes
          control.disable();
        } else {
          control.enable();
        }
      }
    });
    this.physicianForm.get('EnmLipColor').setValue("");
  }
  handleCheckboxNeckCannotBeAccess(assess) {
    const fields = [
      'NLumps',
      'NSwollenGlands',
      'NGoiter',
      'NStiffness'
    ];

    fields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (assess.checked) {
          control.setValue(false);  // Use control.setValue(false) for checkboxes if needed
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }

  handleCheckboxBreastCannotBeAccess(assess) {
    const fields = [
      'BLumps',
      'BPain',
      'BNippleDischarge',
      'BSkinAbnormalities'
    ];

    fields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (assess.checked) {
          control.setValue(false); // Or control.setValue(false) if checkbox
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }
  handleCheckboxResCardiacCannotBeAccess(assess) {
    const fields = [
      'RShortnessBreath',
      'RCough',
      'RWheezing',
      'RCoughingBlood',
      'RProductionPhlegm',
      'RChestPain',
      'RFever',
      'RNightSweats',
      'RBlueFingersToes',
      'RSwellingHandsFeet',
      'RBronchitisEmphysema',
      'RHeartMurmur',
      'RHxHeartMedication',
      'RSkippingHeartBeats'
    ];

    fields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (assess.checked) {
          control.setValue(false);
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }
  handleCheckboxGastroCannotBeAccess(assess) {
    const fields = [
      'GChangeAppetiteWeight',
      'GProblemsSwallowing',
      'GNausea',
      'GHeartburn',
      'GVomiting',
      'GVomitingBlood',
      'GConstipation',
      'GDiarrhea',
      'GChangeBowelHabits',
      'GAbdominalPain',
      'GExcessiveBelching',
      'GExcessiveFlatus',
      'GFoodIntolerance',
      'GRectalBleedingHemo',
      'GYellowColourSkin',
      'GToiletTrained',
      'GUsesDiaper'
    ];

    fields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (assess.checked) {
          control.setValue(false);
          control.disable();
        } else {
          control.enable();
        }
      }
    });

    this.physicianForm.get('GTfreq').setValue("");
    this.physicianForm.get('GUfreq').setValue("");
  }

  handleCheckboxUrinaryCannotBeAccess(assess) {
    const fields = [
      'UDifficultyUrination',
      'UPainBurningUrination',
      'UFrequentUrinationNight',
      'UUrgentNeedUrinate',
      'UIncontinenceUrine',
      'UDribbling',
      'UDecreasedUrineStream',
      'UBloodUrine',
      'UUtiStonesProstate'
    ];

    if (assess.checked) {
      fields.forEach(field => {
        this.physicianForm.controls[field].setValue(false);  // Set value to false
        this.physicianForm.controls[field].disable();        // Then disable
      });
    } else {
      fields.forEach(field => {
        this.physicianForm.controls[field].enable();         // Enable the field
      });
    }
  }

  handleCheckboxPeriCannotBeAccess(assess) {
    const fields = [
      'PLegCramps',
      'PVaricoseVeins',
      'PClotsVeins'
    ];

    if (assess.checked) {
      fields.forEach(field => {
        this.physicianForm.controls[field].setValue(false);
        this.physicianForm.controls[field].disable();
      });
    } else {
      fields.forEach(field => {
        this.physicianForm.controls[field].enable();
      });
    }
  }

  handleCheckboxMusculCannotBeAccess(assess) {
    const fields = [
      'MPain',
      'MSwelling',
      'MStiffness',
      'MDecreasedJointMotion',
      'MBrokenBone',
      'MSeriousSprains',
      'MArthritis',
      'MGout'
    ];

    if (assess.checked) {
      fields.forEach(field => {
        this.physicianForm.controls[field].setValue(false);
        this.physicianForm.controls[field].disable();
      });
    } else {
      fields.forEach(field => {
        this.physicianForm.controls[field].enable();
      });
    }
  }

  handleCheckboxNeuroCannotBeAccess(assess) {
    const fields = [
      'NuHeadaches',
      'NuSeizures',
      'NuParalysis',
      'NuWeakness',
      'NuLossConsciousness',
      'NuLossMuscleSize',
      'NuMuscleSpasm',
      'NuTremor',
      'NuInvoluntaryMovement',
      'NuIncoordination',
      'NuNumbness',
      'NuFeelingPinsNeedles'
    ];

    if (assess.checked) {
      fields.forEach(field => {
        this.physicianForm.controls[field].setValue(false);  // Set to false (for checkboxes)
        this.physicianForm.controls[field].disable();        // Disable field
      });
    } else {
      fields.forEach(field => {
        this.physicianForm.controls[field].enable();         // Enable field
      });
    }
  }

  handleCheckboxHemaCannotBeAccess(assess) {
    const fields = [
      'HeAnemia',
      'HeEasyBruisingBleeding'
    ];

    if (assess.checked) {
      fields.forEach(field => {
        this.physicianForm.controls[field].setValue(false);  // Instead of .reset()
        this.physicianForm.controls[field].disable();
      });
    } else {
      fields.forEach(field => {
        this.physicianForm.controls[field].enable();
      });
    }
  }

  handleCheckboxEndoCannotBeAccess(assess) {
    const fields = [
      'EdAbnormalGrowth',
      'EdIncreasedAppetite',
      'EdIncreasedThirst',
      'EdIncreaseUrineProduction',
      'EdThyroidTrouble',
      'EdHeatColdIntolerance',
      'EdExcessingSweating',
      'EdDiabetes'
    ];

    if (assess.checked) {
      fields.forEach(field => {
        this.physicianForm.controls[field].setValue(false);  // Set to false instead of reset()
        this.physicianForm.controls[field].disable();
      });
    } else {
      fields.forEach(field => {
        this.physicianForm.controls[field].enable();
      });
    }
  }

  handleCheckboxPsyCannotBeAccess(assess) {
    const fields = [
      'PsTensionAnxiety',
      'PsDepressionSuicide',
      'PsMemoryProblems',
      'PsPastTreatmentPsychiatri',
      'PsSleepProblems',
      'PsUnusualProblems',
      'PsChangeMood'
    ];

    if (assess.checked) {
      fields.forEach(field => {
        this.physicianForm.controls[field].setValue(false);
        this.physicianForm.controls[field].disable();
      });
    } else {
      fields.forEach(field => {
        this.physicianForm.controls[field].enable();
      });
    }
  }

  handleCheckboxCannotBeAccess(assess) {
    let allTextBox = [
      'SComments', 'STypeRash', 'HComments', 'EComments', 'EnmLipColor', 'EnmComments', 'NComments', 'BComments', 'RComments', 'GTfreq', 'GUfreq', 'GComments',
      'UComments', 'PComments', 'MComments', 'NuComments', 'HeComments', 'EdComments', 'PsComments'
    ]
    const allFields = [
      // Skin
      'SNoReportedAbnorm', 'SRashes', 'SItching', 'SChangeHairNails',
      // Head
      'HNoReportedAbnorm', 'HHeadInjury',
      // Eyes
      'ENoReportedAbnorm', 'EGlassesContacts', 'EChangeVision', 'EEyePain', 'EDoubleVision', 'EFlashingLights', 'EGlaucomaCataracts', 'ELastEyeExam',
      // Ear/Nose/Throat
      'EneNoReportedAbnorma', 'EneChangeHearing', 'EneTympanicMembrane', 'EneEarDischarge', 'EneRinging', 'EneDizziness',
      'EnnNoReportedAbnorm', 'EnnNoseBleeds', 'EnnNasalStuffiness', 'EnnNasalFlaring', 'EnnFrequentColds', 'EnmBleedingGums', 'EnmSoreTongue',
      // Neck
      'NNoReportedAbnorm', 'NLumps', 'NSwollenGlands', 'NGoiter', 'NStiffness',
      // Breast
      'BNoReportedAbnorm', 'BLumps', 'BPain', 'BNippleDischarge', 'BSkinAbnormalities',
      // Respiratory/Cardiac
      'RNoReportedAbnorm', 'RShortnessBreath', 'RCough', 'RWheezing', 'RCoughingBlood',
      'RProductionPhlegm', 'RChestPain', 'RFever', 'RNightSweats', 'RBlueFingersToes',
      'RSwellingHandsFeet', 'RBronchitisEmphysema', 'RHeartMurmur', 'RHxHeartMedication',
      'RSkippingHeartBeats',
      // GI
      'GNoReportedAbnorm', 'GChangeAppetiteWeight', 'GProblemsSwallowing', 'GNausea', 'GHeartburn',
      'GVomiting', 'GVomitingBlood', 'GConstipation', 'GDiarrhea', 'GChangeBowelHabits',
      'GAbdominalPain', 'GExcessiveBelching', 'GExcessiveFlatus', 'GFoodIntolerance',
      'GRectalBleedingHemo', 'GYellowColourSkin', 'GToiletTrained','GUsesDiaper',
      // Urinary
      'UNoReportedAbnorm', 'UDifficultyUrination', 'UPainBurningUrination', 'UFrequentUrinationNight',
      'UUrgentNeedUrinate', 'UIncontinenceUrine', 'UDribbling', 'UDecreasedUrineStream', 'UBloodUrine',
      'UUtiStonesProstate',
      // Peripheral
      'PNoReportedAbnorm', 'PLegCramps', 'PVaricoseVeins', 'PClotsVeins',
      // Musculoskeletal
      'MNoReportedAbnorm', 'MPain', 'MSwelling', 'MStiffness', 'MDecreasedJointMotion', 'MBrokenBone',
      'MSeriousSprains', 'MArthritis', 'MGout',
      // Neurological
      'NuNoReportedAbnorm', 'NuHeadaches', 'NuSeizures', 'NuParalysis', 'NuWeakness',
      'NuLossConsciousness', 'NuLossMuscleSize', 'NuMuscleSpasm', 'NuTremor',
      'NuInvoluntaryMovement', 'NuIncoordination', 'NuNumbness', 'NuFeelingPinsNeedles',
      // Hematologic
      'HeNoReportedAbnorm', 'HeAnemia', 'HeEasyBruisingBleeding',

      // Endocrine
      'EdNoReportedAbnorm', 'EdAbnormalGrowth', 'EdIncreasedAppetite', 'EdIncreasedThirst',
      'EdIncreaseUrineProduction', 'EdThyroidTrouble', 'EdHeatColdIntolerance', 'EdExcessingSweating',
      'EdDiabetes',

      // Psychiatric
      'PsNoReportedAbnorm', 'PsTensionAnxiety', 'PsDepressionSuicide', 'PsMemoryProblems',
      'PsPastTreatmentPsychiatri', 'PsSleepProblems', 'PsUnusualProblems', 'PsChangeMood',
    ];

    let shouldDisable = assess.checked;

    allFields.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (shouldDisable) {
          control.setValue(false); // Optional: clear checkbox/text
          control.disable();
        } else {
          control.enable();
        }
      }
    });

    allTextBox.forEach(field => {
      const control = this.physicianForm.controls[field];
      if (control) {
        if (shouldDisable) {
          control.setValue('');
          control.disable();
        } else {
          control.enable();
        }
      }
    })
  }

  resetChecbox() {
    this.physicianForm.controls.SNoReportedAbnorm.reset();
    this.physicianForm.controls.SRashes.reset();
    this.physicianForm.controls.STypeRash.reset();
    this.physicianForm.controls.SItching.reset();
    this.physicianForm.controls.SChangeHairNails.reset();
    this.physicianForm.controls.SComments.reset();

    this.physicianForm.controls.HNoReportedAbnorm.reset();
    this.physicianForm.controls.HHeadInjury.reset();
    this.physicianForm.controls.HHeadCircumference.reset();
    this.physicianForm.controls.HComments.reset();

    this.physicianForm.controls.ENoReportedAbnorm.reset();
    this.physicianForm.controls.EGlassesContacts.reset();
    this.physicianForm.controls.EChangeVision.reset();
    this.physicianForm.controls.EEyePain.reset();
    this.physicianForm.controls.EDoubleVision.reset();
    this.physicianForm.controls.EFlashingLights.reset();
    this.physicianForm.controls.EGlaucomaCataracts.reset();
    this.physicianForm.controls.ELastEyeExam.reset();
    this.physicianForm.controls.EComments.reset();

    this.physicianForm.controls.EneNoReportedAbnorma.reset();
    this.physicianForm.controls.EneChangeHearing.reset();
    this.physicianForm.controls.EneTympanicMembrane.reset();
    this.physicianForm.controls.EneEarDischarge.reset();
    this.physicianForm.controls.EneRinging.reset();
    this.physicianForm.controls.EneDizziness.reset();

    this.physicianForm.controls.EnnNoReportedAbnorm.reset();
    this.physicianForm.controls.EnnNoseBleeds.reset();
    this.physicianForm.controls.EnnNasalStuffiness.reset();
    this.physicianForm.controls.EnnNasalFlaring.reset();
    this.physicianForm.controls.EnnFrequentColds.reset();

    this.physicianForm.controls.EnmBleedingGums.reset();
    this.physicianForm.controls.EnmSoreTongue.reset();
    this.physicianForm.controls.EnmLipColor.reset();
    this.physicianForm.controls.EnmComments.reset();

    this.physicianForm.controls.NNoReportedAbnorm.reset();
    this.physicianForm.controls.NLumps.reset();
    this.physicianForm.controls.NSwollenGlands.reset();
    this.physicianForm.controls.NGoiter.reset();
    this.physicianForm.controls.NStiffness.reset();
    this.physicianForm.controls.NComments.reset();

    this.physicianForm.controls.BNoReportedAbnorm.reset();
    this.physicianForm.controls.BLumps.reset();
    this.physicianForm.controls.BPain.reset();
    this.physicianForm.controls.BNippleDischarge.reset();
    this.physicianForm.controls.BSkinAbnormalities.reset();
    this.physicianForm.controls.BComments.reset();

    this.physicianForm.controls.RNoReportedAbnorm.reset();
    this.physicianForm.controls.RShortnessBreath.reset();
    this.physicianForm.controls.RCough.reset();
    this.physicianForm.controls.RWheezing.reset();
    this.physicianForm.controls.RCoughingBlood.reset();
    this.physicianForm.controls.RProductionPhlegm.reset();
    this.physicianForm.controls.RChestPain.reset();
    this.physicianForm.controls.RFever.reset();
    this.physicianForm.controls.RNightSweats.reset();
    this.physicianForm.controls.RBlueFingersToes.reset();
    this.physicianForm.controls.RSwellingHandsFeet.reset();
    this.physicianForm.controls.RBronchitisEmphysema.reset();
    this.physicianForm.controls.RHeartMurmur.reset();
    this.physicianForm.controls.RHxHeartMedication.reset();
    this.physicianForm.controls.RSkippingHeartBeats.reset();
    this.physicianForm.controls.RComments.reset();

    this.physicianForm.controls.GNoReportedAbnorm.reset();
    this.physicianForm.controls.GChangeAppetiteWeight.reset();
    this.physicianForm.controls.GProblemsSwallowing.reset();
    this.physicianForm.controls.GNausea.reset();
    this.physicianForm.controls.GHeartburn.reset();
    this.physicianForm.controls.GVomiting.reset();
    this.physicianForm.controls.GVomitingBlood.reset();
    this.physicianForm.controls.GConstipation.reset();
    this.physicianForm.controls.GDiarrhea.reset();
    this.physicianForm.controls.GChangeBowelHabits.reset();
    this.physicianForm.controls.GAbdominalPain.reset();
    this.physicianForm.controls.GExcessiveBelching.reset();
    this.physicianForm.controls.GExcessiveFlatus.reset();
    this.physicianForm.controls.GFoodIntolerance.reset();
    this.physicianForm.controls.GRectalBleedingHemo.reset();
    this.physicianForm.controls.GYellowColourSkin.reset();
    this.physicianForm.controls.GToiletTrained.reset();
    this.physicianForm.controls.GTfreq.reset();
    this.physicianForm.controls.GUfreq.reset();
    this.physicianForm.controls.GComments.reset();

    this.physicianForm.controls.UNoReportedAbnorm.reset();
    this.physicianForm.controls.UDifficultyUrination.reset();
    this.physicianForm.controls.UPainBurningUrination.reset();
    this.physicianForm.controls.UFrequentUrinationNight.reset();
    this.physicianForm.controls.UUrgentNeedUrinate.reset();
    this.physicianForm.controls.UIncontinenceUrine.reset();
    this.physicianForm.controls.UDribbling.reset();
    this.physicianForm.controls.UDecreasedUrineStream.reset();
    this.physicianForm.controls.UBloodUrine.reset();
    this.physicianForm.controls.UUtiStonesProstate.reset();
    this.physicianForm.controls.UComments.reset();

    this.physicianForm.controls.PNoReportedAbnorm.reset();
    this.physicianForm.controls.PLegCramps.reset();
    this.physicianForm.controls.PVaricoseVeins.reset();
    this.physicianForm.controls.PClotsVeins.reset();
    this.physicianForm.controls.PComments.reset();

    this.physicianForm.controls.MNoReportedAbnorm.reset();
    this.physicianForm.controls.MPain.reset();
    this.physicianForm.controls.MSwelling.reset();
    this.physicianForm.controls.MStiffness.reset();
    this.physicianForm.controls.MDecreasedJointMotion.reset();
    this.physicianForm.controls.MBrokenBone.reset();
    this.physicianForm.controls.MSeriousSprains.reset();
    this.physicianForm.controls.MArthritis.reset();
    this.physicianForm.controls.MGout.reset();
    this.physicianForm.controls.MComments.reset();

    this.physicianForm.controls.NuNoReportedAbnorm.reset();
    this.physicianForm.controls.NuHeadaches.reset();
    this.physicianForm.controls.NuSeizures.reset();
    this.physicianForm.controls.NuParalysis.reset();
    this.physicianForm.controls.NuWeakness.reset();
    this.physicianForm.controls.NuLossConsciousness.reset();
    this.physicianForm.controls.NuLossMuscleSize.reset();
    this.physicianForm.controls.NuMuscleSpasm.reset();
    this.physicianForm.controls.NuTremor.reset();
    this.physicianForm.controls.NuInvoluntaryMovement.reset();
    this.physicianForm.controls.NuIncoordination.reset();
    this.physicianForm.controls.NuNumbness.reset();
    this.physicianForm.controls.NuFeelingPinsNeedles.reset();
    this.physicianForm.controls.NuComments.reset();

    this.physicianForm.controls.HeNoReportedAbnorm.reset();
    this.physicianForm.controls.HeAnemia.reset();
    this.physicianForm.controls.HeEasyBruisingBleeding.reset();
    this.physicianForm.controls.HeComments.reset();

    this.physicianForm.controls.EdNoReportedAbnorm.reset();
    this.physicianForm.controls.EdAbnormalGrowth.reset();
    this.physicianForm.controls.EdIncreasedAppetite.reset();
    this.physicianForm.controls.EdIncreasedThirst.reset();
    this.physicianForm.controls.EdIncreaseUrineProduction.reset();
    this.physicianForm.controls.EdThyroidTrouble.reset();
    this.physicianForm.controls.EdHeatColdIntolerance.reset();
    this.physicianForm.controls.EdExcessingSweating.reset();
    this.physicianForm.controls.EdDiabetes.reset();
    this.physicianForm.controls.EdComments.reset();

    this.physicianForm.controls.PsNoReportedAbnorm.reset();
    this.physicianForm.controls.PsTensionAnxiety.reset();
    this.physicianForm.controls.PsDepressionSuicide.reset();
    this.physicianForm.controls.PsMemoryProblems.reset();
    this.physicianForm.controls.PsPastTreatmentPsychiatri.reset();
    this.physicianForm.controls.PsSleepProblems.reset();
    this.physicianForm.controls.PsUnusualProblems.reset();
    this.physicianForm.controls.PsChangeMood.reset();
    this.physicianForm.controls.PsComments.reset();
  }
  handleCheckboxDiagnosis() {
    if (this.physicianForm.controls.NaDiagnosis.value) {
      this.enableCreateDiagnosis = true;
    } else {
      this.enableCreateDiagnosis = false;
    }
  }
  handleCheckboxVitals() {
    if (this.physicianForm.controls.NaVitalSigns.value) {
      this.enableCreateVitals = true;
    } else {
      this.enableCreateVitals = false;
    }
  }
  handleCheckboxPastMed() {
    if (this.physicianForm.controls.NoMedicalHistory.value) {
      this.enableCreatePMed = true;
    } else {
      this.enableCreatePMed = false;
    }
  }
  handleCheckboxPastSurg() {
    if (this.physicianForm.controls.NoSurgeryHistory.value) {
      this.enableCreatePSurg = true;
    } else {
      this.enableCreatePSurg = false;
    }
  }
  switchTabsForMedicalDecision(tab) {
    this.Problem = false;
    this.Initial = false;
    this.Risk = false;
    this[tab] = true;
  }

  loadMedicationHistoryData() {
    this.selectedMedicationOrder = [];
    this.drugArray = [];
    const profileOrderHistory: Subscription = this.ePrescriptionService.loadData(`e-prescription/OrderHistorylist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        //this.configurationData = resp.body.d.results;
        this.drugArray = resp.body.d.results;
        // this.medicationImportDrugArray=[];

      }
      //   this.filterEvents();
    }, () => { profileOrderHistory.unsubscribe(); });
  }

  medicationImport() {
    // this.medicationImportDrugArray =  this.drugArray ;
    // this.drugArray.forEach(element => {
    this.selectedMedicationOrder.forEach(element => {
      this.medicationImportDrugArray = this.medicationImportDrugArray.concat({
        "Dockey": "",
        "OrderType": this.orderType[element.MotypId],
        "Description": element.Descrlt + element.Quan + element.Quanunit + element.Routedescr + element.N1id,
        "HomeMedication": false,
        "PatientOwnMed": false,
        "Dose": element.Quan + element.Quanunit,
        "Validity": `${new DatePipe('en-US').transform(
          this.getDate(element.StartD),
          'dd.MM.yyyy'
        )}` + '-' + `${new DatePipe('en-US').transform(
          this.getDate(element.EndD),
          'dd.MM.yyyy'
        )}`,
        "Route": element.Routedescr,
        "Amount": "",
        "Rate": "",
        "Therapy": "00000",
        "Id": "",
        "OrderingPhysician": element.EmpRespNm,
        "Cycle": element.N1id
      });
    });
    this.modalRefUpdateName.hide();
  }

  collectMedicationIData(event, item) {
    if (event.target.checked) {
      this.selectedMedicationOrder.push(item);
      // this.medicationImportDrugArray.push(item); 
    } else {
      const indexOf = this.selectedMedicationOrder.findIndex(x => x.Meordid == item.Meordid);
      if (indexOf !== -1)
        this.selectedMedicationOrder.splice(indexOf, 1);
      // this.medicationImportDrugArray.splice(index, 1);
    }
  }

  collectAllMedicationIData(event: any) {
    if (event.target.checked) {
      this.selectedMedicationOrder = (Object.assign([], this.drugArray));
    } else {
      this.selectedMedicationOrder = [];
    }
  }

  isChecked(item: any): boolean {
    return this.selectedMedicationOrder.some(x => x.Meordid == item.Meordid);
  }
  handleCheckboxFamilyHist() {
    if (this.physicianForm.controls.NoFamilyHistory.value) {
      this.enableCreateFamily = true;
    } else {
      this.enableCreateFamily = false;
    }
  }
}
