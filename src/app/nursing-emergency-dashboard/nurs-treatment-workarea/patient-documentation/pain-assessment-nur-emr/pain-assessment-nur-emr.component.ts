import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataShareService } from '@services/data-share.service';
import { FacePaingScaleType } from '@services/e-kardex/interfaces/documents.interface';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pain-assessment-nur-emr',
  templateUrl: './pain-assessment-nur-emr.component.html',
  styleUrls: ['./pain-assessment-nur-emr.component.scss'],
})
export class PainAssessmentNurEmrComponent implements OnInit {
  painAssessmentForm: FormGroup;
  private subscription: Subscription;

  isFacePain: boolean = true;
  isNumericRating: boolean = false;
  isFlacc: boolean = false;
  isNips: boolean = false;
  isComatosePatient: boolean = false;
  isSedation: boolean = false;
  isReAssessment: boolean = false;
  isPainLocation: boolean = false;
  isFlowSheet: boolean = false;
  paniScoreValue = null;

  valueDrop = '0';

  public FacePainResponse: FacePaingScaleType[] = [
    {
      id: 1,
      keyId: 'Nohurt',
      text: 'No hurt',
      value: '0',
      image: 'assets/img/1-happy-face.png',
      isDisable: false,
    },
    {
      id: 2,
      keyId: 'Hurtslittlebit',
      text: 'Hurts little bit',
      value: '2',
      image: 'assets/img/2-face-pain.png',
      isDisable: false,
    },
    {
      id: 2,
      keyId: 'Hurtslittlemore',
      text: 'Hurts little more',
      value: '4',
      image: 'assets/img/3-face-pain.png',
      isDisable: false,
    },
    {
      id: 2,
      keyId: 'Hurtsevenmore',
      text: 'Hurts even more',
      value: '6',
      image: 'assets/img/4-face-pain.png',
      isDisable: false,
    },
    {
      id: 2,
      keyId: 'Hurtswholealot',
      text: 'Hurts whole alot',
      value: '8',
      image: 'assets/img/5-face-pain.png',
      isDisable: false,
    },
    {
      id: 2,
      keyId: 'Hurtsworst',
      text: 'Hurts worst',
      value: '10',
      image: 'assets/img/6-face-pain.png',
      isDisable: false,
    },
  ];

  faceList = [
    {
      label: 'No particular expression / smile',
      value: '0',
    },
    {
      label: 'Occasional grimace / frown, withdrawn, disinterested',
      value: '1',
    },
    {
      label: 'Frequent to constant frown, qulvering chin, clenched jaw',
      value: '2',
    },
  ];

  legList = [
    {
      label: 'Normal position / relaxed',
      value: '0',
    },
    {
      label: 'Uneasy, restless, tense',
      value: '1',
    },
    {
      label: 'Kicking or legs drwan up',
      value: '2',
    },
  ];

  activityList = [
    {
      label: 'Lying quietly, normal position, moves easily',
      value: '0',
    },
    {
      label: 'Squirning, shifting back & forth, tense',
      value: '1',
    },
    {
      label: 'Arched, rigid or jerking',
      value: '2',
    },
  ];

  cryList = [
    {
      label: 'No cry (awake, asleep)',
      value: '0',
    },
    {
      label: 'Moans or whimprs, occasinal complaint',
      value: '1',
    },
    {
      label: 'Crying steadly, screams or sobs, frequent complaints',
      value: '2',
    },
  ];
  consolabilityList = [
    {
      label: 'Content, relaxed',
      value: '0',
    },
    {
      label: 'Rassured by occasional touching, hugging, distractile',
      value: '1',
    },
    {
      label: 'Difficult to console or comfort',
      value: '2',
    },
  ];

  public painScoreList = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
  ];

  public NonMedicationCheckBox = [
    {
      label: 'Heat packs',
    },
    {
      label: 'Cold packs',
    },
    {
      label: 'Repositioning/Turning',
    },
    {
      label: 'Ambulation',
    },
    {
      label: 'Relaxation exercises',
    },
    {
      label: 'Deep Breathing',
    },
    {
      label: 'Rhythmic Breathing',
    },
  ];

  public sedationList = [
    {
      label: 'Unarousable',
      value: '1',
    },
    {
      label: 'Very sedated',
      value: '2',
    },
    {
      label: 'Sedated',
      value: '3',
    },
    {
      label: 'Calm & Cooperative',
      value: '4',
    },
    {
      label: 'Agitated',
      value: '5',
    },
    {
      label: 'Very agitated',
      value: '6',
    },
    {
      label: 'Dangerous Agitation',
      value: '7',
    },
  ];

  public ReAssessmentInterventions = [
    {
      label: 'Continue Current Treatment',
      value: '0',
    },
  ];

  public ReAssessmentPainRadi = [
    {
      label: 'Yes',
      value: '0',
    },
    {
      label: 'No',
      value: '1',
    },
  ];

  public ReAssessmentPainPattern = [
    {
      label: 'Constant',
      value: '0',
    },
    {
      label: 'Intermittent',
      value: '1',
    },
  ];

  public ReAssessmentPainOnset = [
    {
      label: 'Acute',
      value: '0',
    },
    {
      label: 'Chronic',
      value: '1',
    },
  ];

  public flowSheetInfusion = [
    {
      label: 'ml/hr',
      value: '0',
    },
    {
      label: 'mg/hr',
      value: '1',
    },
  ];

  public flowSheetSedation = [
    {
      label: 'Alert',
      value: '0',
    },
    {
      label: 'Mild, occasionally drowsy, easy to arouse',
      value: '1',
    },
    {
      label: 'Moderate, frequently drowsy, easy to arouse',
      value: '1',
    },
    {
      label: 'Severe, somnolent, difficult to arouse',
      value: '2',
    },
    {
      label: 'Normal sleep',
      value: '3',
    },
  ];

  public flowSheetSideEffects = [
    {
      label: 'Constipation',
      value: '0',
    },
    {
      label: 'Vomitting',
      value: '1',
    },
    {
      label: 'Nausea',
      value: '2',
    },
    {
      label: 'Dyspnea',
      value: '3',
    },
    {
      label: 'Itching',
      value: '4',
    },
  ];

  public dockeyValue: any = null;
  public totalScore: any = '0';
  public facePainDescription: string = 'No hurt';
  public facePainScaleData: any;
  public comment: string;
  reAssessmentTableList: any = [];
  characterConcate: any = [];
  NoMedicationConcate: any = [];
  userProfile: any;
  flowSheetAssessmentList: any = [];
  otherConcate: any = [];
  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private datePipe: DatePipe,
    private emergencyService: EmergencyService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.userProfile = this.storageService.getUserProfile();

  }

  

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');

    this.painAssessmentForm = this.formBuilder.group({
      Dockey: '',
      Dtid: 'ZMED_PAIN',
      Einri: this.storageService.einri,
      Patnr: this.storageService.patnr,
      Falnr: this.storageService.falnr,
      Lfdnr: this.storageService.lfdnr,
      Orgdo: 'F21IUAMC',
      FpNa: false,
      FpPainScale: '',
      FpTotalScore: '',
      FpTotalScoreTxt: '',
      NrsNa: false,
      NrsPainScore: '',
      NrsTotalScore: '',
      NrsTotalScoreTxt: '',
      FlNa: false,
      FlFace: '',
      FlLeg: '',
      FlActivity: '',
      FlCry: '',
      FlConsolability: '',
      FlScore: '',
      FlScoreTxt: '',
      NiFacial: '',
      NiCry: '',
      NiBreathing: '',
      NiArms: '',
      NiLegs: '',
      NiArousal: '',
      NiTotalScore: '',
      NiTotalScoreTxt: '',
      ComNoSigns: false,
      ComIrIntermittent: false,
      ComIrActivity: false,
      ComIrFrowning: false,
      ComIrMildly: false,
      ComIrArousability: false,
      ComIrUnexplained: false,
      ComPaLoudCry: false,
      ComPaRefuses: false,
      ComPaThrashing: false,
      ComPaMarked: false,
      ComPaActivity: false,
      ComPaTense: false,
      ComPaFleshed: false,
      ComPaSleep: false,
      ComPaWithdraw: false,
      ComPaDuskiness: false,
      ComPaRrHr: false,
      ComScore: '',
      ComComment: '',
      SedationAgitation: '',
      SedationScore: '',
      SedationComment: '',
      PlDate: new Date(),
      PlTime: currentTime,
      PlPainIntensity: '',
      PlPainScaling: '',
      PlChSharp: false,
      PlChDull: false,
      PlChStabbing: false,
      PlChBurns: false,
      PlChCrushing: false,
      PlChDeep: false,
      PlChSore: false,
      PlChAching: false,
      PlChColic: false,
      PlChThrobbing: false,
      PlChNumb: false,
      PlChShooting: false,
      PlChPressing: false,
      PlChTight: false,
      PlChPulling: false,
      PlChSqueezing: false,
      PlLocation: '',
      PlFrequency: '',
      PlDuration: '',
      PlInterventions: '',
      PlRadiation: '',
      PlRadiationTxt: '',
      PlPattern: '',
      PlOnset: '',
      PlCauses: '',
      PlRelieves: '',
      PlMedication: '',
      PlHeatPacks: false,
      PlColdPacks: false,
      PlRepositioning: false,
      PlAmbulation: false,
      PlRelaxation: false,
      PlDeep: false,
      PlRhythmic: false,
      PlComment: '',
      FloDate: new Date(),
      FloTime: currentTime,
      FloPsRest: '',
      FloPsMovement: '',
      FloPreRest: '',
      FloPreMovement: '',
      FloIvInfusion: '',
      FloIvBolus: '',
      FloIvAmount: '',
      FloPcaReservoir: '',
      FloPcaInfusion: '',
      FloPcaInfusionUnit: '',
      FloPcaDemandDose: '',
      FloPcaTimeInterval: '',
      FloPcaMaximumDoses: '',
      FloPcaDoseGiven: '',
      FloPcaDoseAttempted: '',
      FloPcaClinicalBolus: '',
      FloPcaAmount: '',
      FloEpiInfusion: '',
      FloEpiBlock: '',
      FloEpiAmount: '',
      FloOthIvStat: false,
      FloOthIvPrn: false,
      FloOthLocally: false,
      FloOral: '',
      FloTransdermal: '',
      FloSedation: '',
      FloSideEffects: '',
      AttendPhy: this.storageService.getGpart(),
      DocStatus: '1',
    });
  }

  public switchTabs(tab) {
    if (tab == 'isFacePain') {
      this.isFacePain = true;
      this.isNumericRating = false;
      this.isFlacc = false;
      this.isNips = false;
      this.isComatosePatient = false;
      this.isSedation = false;
      this.isReAssessment = false;
      this.isPainLocation = false;
      this.isFlowSheet = false;
    } else if (tab == 'isNumericRating') {
      this.isFacePain = false;
      this.isNumericRating = true;
      this.isFlacc = false;
      this.isNips = false;
      this.isComatosePatient = false;
      this.isSedation = false;
      this.isReAssessment = false;
      this.isPainLocation = false;
      this.isFlowSheet = false;
    } else if (tab == 'isFlacc') {
      this.isFacePain = false;
      this.isNumericRating = false;
      this.isFlacc = true;
      this.isNips = false;
      this.isComatosePatient = false;
      this.isSedation = false;
      this.isReAssessment = false;
      this.isPainLocation = false;
      this.isFlowSheet = false;
    } else if (tab == 'isNips') {
      this.isFacePain = false;
      this.isNumericRating = false;
      this.isFlacc = false;
      this.isNips = true;
      this.isComatosePatient = false;
      this.isSedation = false;
      this.isReAssessment = false;
      this.isPainLocation = false;
      this.isFlowSheet = false;
    } else if (tab == 'isComatosePatient') {
      this.isFacePain = false;
      this.isNumericRating = false;
      this.isFlacc = false;
      this.isNips = false;
      this.isComatosePatient = true;
      this.isSedation = false;
      this.isReAssessment = false;
      this.isPainLocation = false;
      this.isFlowSheet = false;
    } else if (tab == 'isSedation') {
      this.isFacePain = false;
      this.isNumericRating = false;
      this.isFlacc = false;
      this.isNips = false;
      this.isComatosePatient = false;
      this.isSedation = true;
      this.isReAssessment = false;
      this.isPainLocation = false;
      this.isFlowSheet = false;
    } else if (tab == 'isReAssessment') {
      this.isFacePain = false;
      this.isNumericRating = false;
      this.isFlacc = false;
      this.isNips = false;
      this.isComatosePatient = false;
      this.isSedation = false;
      this.isReAssessment = true;
      this.isPainLocation = false;
      this.isFlowSheet = false;
    } else if (tab == 'isPainLocation') {
      this.isFacePain = false;
      this.isNumericRating = false;
      this.isFlacc = false;
      this.isNips = false;
      this.isComatosePatient = false;
      this.isSedation = false;
      this.isReAssessment = false;
      this.isPainLocation = true;
      this.isFlowSheet = false;
    } else if (tab == 'isFlowSheet') {
      this.isFacePain = false;
      this.isNumericRating = false;
      this.isFlacc = false;
      this.isNips = false;
      this.isComatosePatient = false;
      this.isSedation = false;
      this.isReAssessment = false;
      this.isPainLocation = false;
      this.isFlowSheet = true;
    }
  }

  // Face Pain
  public selectRadio(id: string, value: string, description: string) {
    if (this.dockeyValue) return;
    const radioBtn = document.getElementById(id) as HTMLInputElement;
    if (radioBtn) {
      radioBtn.checked = true;
    }
    this.setFacePainValue(value, description);
  }

  public setFacePainValue(value: any, description: string) {
    if (this.painAssessmentForm.get('FpNa').value) return;
    this.painAssessmentForm.patchValue({
      FpTotalScore: value,
      FpTotalScoreTxt: description,
    });
    this.totalScore = value;
    this.facePainDescription = description;
  }

  public uncheckFacePain() {
    this.painAssessmentForm.patchValue({
      FpTotalScore: '',
      FpTotalScoreTxt: '',
      FpPainScale: '',
    });
  }

  // Numeric Rating Scale
  selectPainScore() {
    this.painAssessmentForm.patchValue({
      NrsTotalScore: this.painAssessmentForm.value.NrsPainScore,
      NrsTotalScoreTxt: this.setDescription(
        this.painAssessmentForm.value.NrsPainScore
      ),
    });
  }

  setDescription(value) {
    if (parseInt(value) <= 0) {
      return 'No pain';
    } else if (parseInt(value) >= 1 && parseInt(value) <= 3) {
      return 'Slight pain';
    } else if (parseInt(value) == 4) {
      return 'Slight pain';
    } else if (parseInt(value) >= 5 && parseInt(value) <= 6) {
      return 'Slight pain';
    } else if (parseInt(value) >= 7 && parseInt(value) <= 9) {
      return 'Slight pain';
    } else if (parseInt(value) == 10) {
      return 'Worst pain possible';
    }
  }

  uncheckRatingValue() {
    this.painAssessmentForm.patchValue({
      NrsTotalScoreTxt: '',
      NrsTotalScore: '',
      NrsPainScore: '',
    });
  }

  // FLACC
  uncheckFLACC() {
    this.painAssessmentForm.patchValue({
      FlFace: '',
      FlLeg: '',
      FlActivity: '',
      FlCry: '',
      FlConsolability: '',
      FlScore: '',
      FlScoreTxt: '',
    });
  }

  totalOfFlacc() {
    const face = parseFloat(this.painAssessmentForm.get('FlFace').value) || 0;
    const leg = parseFloat(this.painAssessmentForm.get('FlLeg').value) || 0;
    const activity =
      parseFloat(this.painAssessmentForm.get('FlActivity').value) || 0;
    const cry = parseFloat(this.painAssessmentForm.get('FlCry').value) || 0;
    const consolability =
      parseFloat(this.painAssessmentForm.get('FlConsolability').value) || 0;

    const totalScore = face + leg + activity + cry + consolability;

    this.painAssessmentForm.get('FlScore').setValue(totalScore.toString());

    let description;
    if (totalScore === 0) {
      description = 'Relaxed and Comfortable';
    } else if (totalScore >= 1 && totalScore <= 3) {
      description = 'Mild pain / mild discomfort';
    } else if (totalScore >= 4 && totalScore <= 6) {
      description = 'Moderate pain';
    } else if (totalScore >= 7 && totalScore <= 10) {
      description = 'Severe pain';
    } else {
      description = '';
    }

    this.painAssessmentForm.get('FlScoreTxt').setValue(description);
  }

  // NIPS
  totalOfNips() {
    if (
      this.painAssessmentForm.get('NiFacial').value == 'A' ||
      this.painAssessmentForm.get('NiCry').value == 'A' ||
      this.painAssessmentForm.get('NiBreathing').value == 'A' ||
      this.painAssessmentForm.get('NiArms').value == 'A' ||
      this.painAssessmentForm.get('NiLegs').value == 'A' ||
      this.painAssessmentForm.get('NiArousal').value == 'A'
    ) {
      this.painAssessmentForm.get('NiTotalScore').setValue('N/A');
      this.painAssessmentForm
        .get('NiTotalScoreTxt')
        .setValue('Not all questions are answered');
      return;
    }

    const facial =
      parseFloat(this.painAssessmentForm.get('NiFacial').value) || 0;
    const cry = parseFloat(this.painAssessmentForm.get('NiCry').value) || 0;
    const breathing =
      parseFloat(this.painAssessmentForm.get('NiBreathing').value) || 0;
    const arms = parseFloat(this.painAssessmentForm.get('NiArms').value) || 0;
    const legs = parseFloat(this.painAssessmentForm.get('NiLegs').value) || 0;
    const arousal =
      parseFloat(this.painAssessmentForm.get('NiArousal').value) || 0;

    // Calculate total score
    const totalScore = facial + cry + breathing + arms + legs + arousal;

    // Update the value of nipstotalscore form control
    this.painAssessmentForm.get('NiTotalScore').setValue(totalScore.toString());
    let description;
    // Assign description based on total score
    if (totalScore >= 0 && totalScore <= 2) {
      description = 'Mild to no pain';
    } else if (totalScore >= 3 && totalScore <= 4) {
      description = 'Mild to moderate pain';
    } else if (totalScore > 4) {
      description = 'Severe pain';
    } else {
      description = '';
    }

    // Update the value of nipsdescription form control
    this.painAssessmentForm.get('NiTotalScoreTxt').setValue(description);
  }

  // Comatose Patient Adult and Pediatrics
  uncheckComatose() {
    this.painAssessmentForm.patchValue({
      ComIrIntermittent: false,
      ComIrActivity: false,
      ComIrFrowning: false,
      ComIrMildly: false,
      ComIrArousability: false,
      ComIrUnexplained: false,
      ComPaLoudCry: false,
      ComPaRefuses: false,
      ComPaThrashing: false,
      ComPaMarked: false,
      ComPaActivity: false,
      ComPaTense: false,
      ComPaFleshed: false,
      ComPaSleep: false,
      ComPaWithdraw: false,
      ComPaDuskiness: false,
      ComPaRrHr: false,
      ComScore: '',
      ComComment: '',
    });
  }

  calculateScore() {
    let totalScore = 0;
    const checkboxScores = {
      ComIrIntermittent: 2,
      ComIrActivity: 2,
      ComIrFrowning: 2,
      ComIrMildly: 2,
      ComIrArousability: 2,
      ComIrUnexplained: 2,
      ComPaLoudCry: 1,
      ComPaRefuses: 1,
      ComPaThrashing: 1,
      ComPaMarked: 1,
      ComPaActivity: 1,
      ComPaTense: 1,
      ComPaFleshed: 1,
      ComPaSleep: 1,
      ComPaWithdraw: 1,
      ComPaDuskiness: 1,
      ComPaRrHr: 1,
    };

    // Calculate the total score based on selected checkboxes
    Object.keys(checkboxScores).forEach((key) => {
      if (this.painAssessmentForm.get(key).value) {
        totalScore += checkboxScores[key];
      }
    });

    // Update the ComScore field in the form with the calculated score
    this.painAssessmentForm.patchValue({
      ComScore: totalScore, // Convert score to string if needed
    });
  }

  // Sedation & Agitation

  calculateOfSedation() {
    this.painAssessmentForm.patchValue({
      SedationScore: Number(this.painAssessmentForm.value.SedationAgitation),
    });
  }

  // Assessment ans Re-Assessment
  reAssessmentSetTable() {
    let characterJoin = this.characterConcate.join(',');
    let nonMedicationJoin = this.NoMedicationConcate.join(',');
    let payload = {
      Dockey: '',
      PlDate: this.painAssessmentForm.value.PlDate,
      PlTime: this.painAssessmentForm.value.PlTime,
      PlPainIntensity: this.painAssessmentForm.value.PlPainIntensity,
      PlPainScaling: this.painAssessmentForm.value.PlPainScaling,
      PlCharacter: characterJoin,
      PlLocation: this.painAssessmentForm.value.PlLocation,
      PlFrequency: this.painAssessmentForm.value.PlFrequency,
      PlDuration: this.painAssessmentForm.value.PlDuration,
      PlInterventions: this.ReAssessmentInterventions.find(
        (res) => this.painAssessmentForm.value.PlInterventions == res.value
      ).label,
      PlRadiation: this.ReAssessmentPainRadi.find(
        (res) => this.painAssessmentForm.value.PlRadiation == res.value
      ).label,
      PlRadiationTxt: this.painAssessmentForm.value.PlRadiationTxt,
      PlPattern: this.ReAssessmentPainPattern.find(
        (res) => this.painAssessmentForm.value.PlPattern == res.value
      ).label,
      PlOnset: this.ReAssessmentPainOnset.find(
        (res) => this.painAssessmentForm.value.PlOnset == res.value
      ).label,
      PlCauses: this.painAssessmentForm.value.PlCauses,
      PlRelieves: this.painAssessmentForm.value.PlRelieves,
      PlMedication: this.painAssessmentForm.value.PlMedication,
      PlNonMedication: nonMedicationJoin,
      PlComment: this.painAssessmentForm.value.PlComment,
      doneBy: this.userProfile?.GpartName,
    };

    this.reAssessmentTableList.push(payload);
  }

  characterCheck(event, value) {
    if (event.target.checked) {
      this.characterConcate.push(value);
    } else {
      let index = this.characterConcate.indexOf(value);
      if (index !== -1) {
        this.characterConcate.splice(index, 1);
      }
    }
  }

  nonMedicationCheck(event, value) {
    if (event.target.checked) {
      this.NoMedicationConcate.push(value);
    } else {
      let index = this.NoMedicationConcate.indexOf(value);
      if (index !== -1) {
        this.NoMedicationConcate.splice(index, 1);
      }
    }
  }

  clearReAssessmentForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');

    this.painAssessmentForm.patchValue({
      PlDate: new Date(),
      PlTime: currentTime,
      PlPainIntensity: '',
      PlPainScaling: '',
      PlChSharp: false,
      PlChDull: false,
      PlChStabbing: false,
      PlChBurns: false,
      PlChCrushing: false,
      PlChDeep: false,
      PlChSore: false,
      PlChAching: false,
      PlChColic: false,
      PlChThrobbing: false,
      PlChNumb: false,
      PlChShooting: false,
      PlChPressing: false,
      PlChTight: false,
      PlChPulling: false,
      PlChSqueezing: false,
      PlLocation: '',
      PlFrequency: '',
      PlDuration: '',
      PlInterventions: '',
      PlRadiation: '',
      PlRadiationTxt: '',
      PlPattern: '',
      PlOnset: '',
      PlCauses: '',
      PlRelieves: '',
      PlMedication: '',
      PlHeatPacks: false,
      PlColdPacks: false,
      PlRepositioning: false,
      PlAmbulation: false,
      PlRelaxation: false,
      PlDeep: false,
      PlRhythmic: false,
      PlComment: '',
    });
  }

  // Assessment and Management Flow Sheet
  flowSheetSetTable() {
    let characterJoin = this.otherConcate.join(',');
    let payload = {
      Dockey: '',
      FloDate: this.painAssessmentForm.value.FloDate,
      FloTime: this.painAssessmentForm.value.FloTime,
      FloPsRest: this.painAssessmentForm.value.FloPsRest,
      FloPsMovement: this.painAssessmentForm.value.FloPsMovement,
      FloPreRest: this.painAssessmentForm.value.FloPreRest,
      FloPreMovement: this.painAssessmentForm.value.FloPreMovement,
      FloIvInfusion: this.painAssessmentForm.value.FloIvInfusion,
      FloIvBolus: this.painAssessmentForm.value.FloIvBolus,
      FloIvAmount: this.painAssessmentForm.value.FloIvAmount,
      FloPcaReservoir: this.painAssessmentForm.value.FloPcaReservoir,
      FloPcaInfusion: this.painAssessmentForm.value.FloPcaInfusion,
      FloPcaDemandDose: this.painAssessmentForm.value.FloPcaDemandDose,
      FloPcaTimeInterval: this.painAssessmentForm.value.FloPcaTimeInterval,
      FloPcaMaximumDoses: this.painAssessmentForm.value.FloPcaMaximumDoses,
      FloPcaDoseGiven: this.painAssessmentForm.value.FloPcaDoseGiven,
      FloPcaDoseAttempted: this.painAssessmentForm.value.FloPcaDoseAttempted,
      FloPcaClinicalBolus: this.painAssessmentForm.value.FloPcaClinicalBolus,
      FloPcaAmount: this.painAssessmentForm.value.FloPcaAmount,
      FloEpiInfusion: this.painAssessmentForm.value.FloEpiInfusion,
      FloEpiBlock: this.painAssessmentForm.value.FloEpiBlock,
      FloEpiAmount: this.painAssessmentForm.value.FloEpiAmount,
      FloOral: this.painAssessmentForm.value.FloOral,
      FloTransdermal: this.painAssessmentForm.value.FloTransdermal,
      FloSedation: this.painAssessmentForm.value.FloSedation,
      FloSideEffects: this.painAssessmentForm.value.FloSideEffects,
      FloAssessedBy: this.painAssessmentForm.value.FloAssessedBy,
      FloOther: characterJoin,
    };

    this.flowSheetAssessmentList.push(payload);
  }

  otherTextJoin(event, value) {
    if (event.target.checked) {
      this.otherConcate.push(value);
    } else {
      let index = this.otherConcate.indexOf(value);
      if (index !== -1) {
        this.otherConcate.splice(index, 1);
      }
    }
  }

  transformDate(dateString: string): string {
    const date = new Date(dateString);
    const timestamp = date.getTime();
    return `/Date(${timestamp})/`;
  }

  transformTime(timeString: string): string {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return `PT${hours}H${minutes}M${seconds}S`;
  }

  savePainAssessmentDoc(): Promise<any> {
    let painAssessmentValue: any = JSON.parse(JSON.stringify(this.painAssessmentForm.value));
    console.log(painAssessmentValue, '----');
    return new Promise((resolve, reject) => {
      if(this.flowSheetAssessmentList.length) {
        this.flowSheetAssessmentList.forEach((element) =>{
          element.FloDate = this.transformDate(painAssessmentValue.FloDate),
          element.FloTime = this.transformTime(painAssessmentValue.FloTime)
        })
      }

      if(this.reAssessmentTableList.length) {
        this.reAssessmentTableList.forEach((element) =>{
          element.PlDate = this.transformDate(painAssessmentValue.PlDate),
          element.PlTime = this.transformTime(painAssessmentValue.PlTime)
        })
      }
      let payload = {
        ...painAssessmentValue,
        PlDate: this.transformDate(painAssessmentValue.PlDate),
        PlTime: this.transformTime(painAssessmentValue.PlTime),
        TOPAINLOGS: this.reAssessmentTableList,
        TOFLOWSHEET: this.flowSheetAssessmentList,
        FloDate: this.transformDate(painAssessmentValue.FloDate),
        FloTime: this.transformTime(painAssessmentValue.FloTime),
        FloPcaTimeInterval: Number(painAssessmentValue.FloPcaTimeInterval)
      };

      let mainPayload = { d: payload };

      // return
      this.subscription = this.emergencyService
        .createPainAssessmentDoc(mainPayload)
        .subscribe({
          next: (data: any) => {},
          error: (err: any) => {
            this.sharedService.waringSwallModel(`Error ${err}`);
            this.sharedService.waringSwallModel(
              `POST Error at Nurse Endorsment : ${err}`
            );
          },
          complete: () => {
            resolve(true);
            this.sharedService.successSwallModel(
              'Nurse Endorsment created successfully'
            );
          },
        });
    });
  }

}
