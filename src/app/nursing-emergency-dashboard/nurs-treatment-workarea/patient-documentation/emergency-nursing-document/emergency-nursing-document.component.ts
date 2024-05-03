import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { commonKeyValuePair, commonKeyValuePariExt0, commonKeyValuePariExt1, commonKeyValuePariExt2, commonKeyValuePariExt3, commonKeyValuePariExt4 } from '@services/e-kardex/interfaces/documents.interface';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType, WordType, AssessmentType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription, catchError, of } from 'rxjs';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { PhysicianAllergyComponent } from './physician-allergy/physician-allergy.component';
import { ErVitalComponent } from './er-vital/er-vital.component';
import { SocialHabitComponent } from './social-habit/social-habit.component';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { FacePainScalePopupComponent } from './face-pain-scale/face-pain-scale-popup.component';
import { NumericRatingScalePopupComponent } from './numeric-rating-scale/numeric-rating-scale-popup.component';

@Component({
  selector: 'app-emergency-nursing-document',
  templateUrl: './emergency-nursing-document.component.html',
  styleUrls: ['./emergency-nursing-document.component.scss']
})
export class EmergencyNursingDocumentComponent implements OnInit, OnDestroy {

  @ViewChild('allergyModal', { static: true }) allergyModal: TemplateRef<any>;
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalComponent;
  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScalePopupComponent;
  @ViewChild('scalesFacePain') scalesFacePain: FacePainScalePopupComponent;
  @ViewChild('scalesNumericRating') scalesNumericRating: NumericRatingScalePopupComponent;
  @ViewChild('socialAddHabit') socialAddHabit: SocialHabitComponent;

  public triageForm: FormGroup;
  public AssessmentType = AssessmentType;
  public modeArrivalList: commonKeyValuePair[] = [
    { value: '0', label: 'Stretcher' },
    { value: '1', label: 'Ambulatory' },
    { value: '2', label: 'Wheel Chair' },
    { value: '3', label: 'Carried' },
    { value: '4', label: 'Cuddled' },
    { value: '5', label: 'Other' },
  ];

  public socialHistoryList: commonKeyValuePariExt0[] = [
    { Habitid: '', value: '0', label: 'Alcohol', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, },
    { value: '1', label: 'Drugs', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
    { value: '2', label: 'Tobacco', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
    { value: '3', label: 'Other', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
  ];

  public accompaniedList: commonKeyValuePair[] = [
    { value: '0', label: 'Spouse' },
    { value: '1', label: 'Relative' },
    { value: '2', label: 'Parents' },
    { value: '3', label: 'Guardian' },
    { value: '4', label: 'Police Officer' },
    { value: '5', label: 'Civil Defence' },
    { value: '6', label: 'Other' },
  ];

  public triageList: commonKeyValuePariExt1[] = [
    { value: '0', label: 'Level I Resuscritation', TriagePriorityCode: '01', TriageColor: 'blue' },
    { value: '1', label: 'Level II Emergency', TriagePriorityCode: '02', TriageColor: 'red' },
    { value: '2', label: 'Level III Urgency', TriagePriorityCode: '03', TriageColor: 'yellow' },
    { value: '3', label: 'Level IV Less Urgency', TriagePriorityCode: '04', TriageColor: 'green' },
    { value: '4', label: 'Level V Non Urgency', TriagePriorityCode: '05', TriageColor: 'white' }
  ];

  public triagePriorities: commonKeyValuePariExt2[] = [
    { value: '01', label: 'Resuscitation', backgroundColor: 'blue', borderColor: '#cacaca', fontColor: 'white' },
    { value: '02', label: 'Emergency', backgroundColor: 'red', borderColor: '#cacaca', fontColor: 'white' },
    { value: '03', label: 'Urgency', backgroundColor: 'yellow', borderColor: '#cacaca', fontColor: 'black' },
    { value: '04', label: 'Less Urgency', backgroundColor: 'green', borderColor: '#cacaca', fontColor: 'white' },
    { value: '05', label: 'Non Urgency', backgroundColor: 'white', borderColor: '#cacaca', fontColor: 'black' }
  ];

  public scalesList: commonKeyValuePariExt3[] = [
    { ScaleType: 'Glasgow Coma Scale', LastScore: '', description: '', Datetimee: '', value: '1', Dockey: '' },
    { ScaleType: 'Face pain scale', LastScore: '', description: '', Datetimee: '', value: '2', Dockey: '' },
    { ScaleType: 'Numeric rating scale(more than 8 years)', LastScore: '', description: '', Datetimee: '', value: '3', Dockey: '' },
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

  public needSupervisionList: commonKeyValuePariExt4[] = [
    { value: '01', label: 'Feeding', controlname: 'FunFeeding' },
    { value: '02', label: 'Hygiene', controlname: 'FunHygiene' },
    { value: '03', label: 'Toileting', controlname: 'FunToileting' },
    { value: '04', label: 'Amulation', controlname: 'FunAmulation' },
  ];

  public problemIdentifiedList: commonKeyValuePair[] = [
    { value: '0', label: 'Deformities' },
    { value: '1', label: 'Contractures' },
    { value: '2', label: 'Amputeee' },
    { value: '3', label: 'Bedridden' },
    { value: '4', label: 'Musculoskeletal pain' },
  ];

  public usedEquipments: commonKeyValuePair[] = [
    { value: '0', label: 'Walker' },
    { value: '1', label: 'Wheelchair' },
    { value: '2', label: 'Transer Device' },
    { value: '3', label: 'Bathing Device' },
    { value: '4', label: 'Raised Device' },
    { value: '5', label: 'Others' },
  ];

  public doctorNotication: commonKeyValuePair[] = [
    { value: '0', label: 'Yes' },
    { value: '1', label: 'No' },
  ];

  public notication: commonKeyValuePair[] = [
    { value: '0', label: 'Yes' },
    { value: '1', label: 'No' },
  ];

  public nutritionalRisk: commonKeyValuePariExt4[] = [
    { id: '1', value: '3', label: '(3) Pregnancy', controlname: 'nrPregnancy' },
    { id: '6', value: '3', label: '(3) Underweight', controlname: 'nrUnderweight' },
    { id: '11', value: '3', label: '(3) Malnutrition', controlname: 'nrMalnutrition' },
    { id: '15', value: '3', label: '(3) Renal disease hepatitis', controlname: 'nrRenaldiseasehepatitis' },

    { id: '2', value: '2', label: '(2) HTN', controlname: 'nrHtn' },
    { id: '7', value: '2', label: '(2) COPD', controlname: 'nrCopd' },
    { id: '12', value: '2', label: '(2) CHF', controlname: 'nrChf' },
    { id: '16', value: '2', label: '(2) CAD', controlname: 'nrCad' },

    { id: '3', value: '2', label: '(2) Eating disorder', controlname: 'nrEatingdisorder' },
    { id: '8', value: '1', label: '(1) Food allergies', controlname: 'nrFoodallergies' },
    { id: '13', value: '1', label: '(1) Chewing Problem', controlname: 'nrChewingProblem' },
    { id: '17', value: '1', label: '(1) Chronic Constipation', controlname: 'nrChronicConstipation' },

    { id: '4', value: '1', label: '(1) Vomitting > 48 h ', controlname: 'nrVomitting' },
    { id: '9', value: '1', label: '(1) Diarrhea < 48 h ', controlname: 'nrDiarrhea' },
    { id: '14', value: '3', label: '(3) Diabetes', controlname: 'nrDiabetes' },
    { id: '17', value: '3', label: '(3) HIV / AIDS', controlname: 'nrHiv' },

    { id: '5', value: '2', label: '(2) G I disorder', controlname: 'nrGidisorder' },
    { id: '10', value: '1', label: '(1) Low albumin', controlname: 'nrLowalbumin' },
  ];

  public appetiteList: commonKeyValuePair[] = [
    { value: '1', label: 'Good' },
    { value: '2', label: 'Fair' },
    { value: '3', label: 'Poor' },
    { value: '4', label: 'Other' },
  ];

  public generalApperianceList: commonKeyValuePair[] = [
    { value: '1', label: 'Normal' },
    { value: '2', label: 'Obese' },
    { value: '3', label: 'Emaciated' },
    { value: '4', label: 'Other' },
  ];

  public feedingDefficulties: commonKeyValuePair[] = [
    { value: '1', label: 'No difficulty' },
    { value: '2', label: 'Chewing Abnormal' },
    { value: '3', label: 'Swollen' },
    { value: '4', label: 'Unable to feed self' },
    { value: '5', label: 'Other, Specity' },
  ];

  public nutritionalSupportList: commonKeyValuePair[] = [
    { value: '1', label: 'None' },
    { value: '2', label: 'TPN' },
    { value: '3', label: 'Tube feeding' },
    { value: '4', label: 'Other' },
  ];

  public dietList: commonKeyValuePair[] = [
    { value: '1', label: 'Normal' },
    { value: '2', label: 'Special' },
    { value: '3', label: 'Other' },
  ];

  public reviewSystemTabList: commonKeyValuePair[] = [
    { value: '1', label: 'Skin', image: './assets/img/skin-cell.png' },
    { value: '2', label: 'Head', image: './assets/img/stress.png' },
    { value: '3', label: 'Eyes', image: './assets/img/eyes_pain.png' },
    { value: '4', label: 'ENT', image: './assets/img/ear.png' },
    { value: '5', label: 'Neck', image: './assets/img/neck.png' },
    { value: '6', label: 'Breast', image: './assets/img/breast.png' },
    { value: '7', label: 'Respriration/Cardiac', image: './assets/img/cardiac.png' },
    { value: '8', label: 'Gastrointestinal', image: './assets/img/gastrointestinal.png' },
    { value: '9', label: 'Urinary', image: './assets/img/bladder.png' },
    { value: '10', label: 'Peripheral Vescular', image: './assets/img/knee-brace.png' },
    { value: '11', label: 'Musculoskeletal', image: './assets/img/muscles.png' },
    { value: '12', label: 'Neurologic', image: './assets/img/brain.png' },
    { value: '13', label: 'Hematologic', image: './assets/img/bandage.png' },
    { value: '14', label: 'Endocrine', image: './assets/img/endocrine-system.png' },
    { value: '15', label: 'Psychiatric', image: './assets/img/thinking.png' },
  ];


  public skinIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Rashes', controlname: 'SRashes' },
    { value: '2', label: 'Itching', controlname: 'SItching' },
    { value: '3', label: 'Change in hair or nails', controlname: 'SChangeHairNails' },
  ];

  public skinRashist: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Petechial', controlname: 'skrPetechial' },
    { value: '2', label: 'Maculopapular', controlname: 'skrMaculopapular' },
    { value: '3', label: 'Haemorrhagic', controlname: 'skrHaemorrhagic' },
    { value: '4', label: 'Other', controlname: 'skrOther' },
  ];

  public headIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Head Injury', controlname: 'HHeadInjury' },
  ];


  public eyesIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Glassses or contacts', controlname: 'EGlassesContacts' },
    { value: '2', label: 'Change in vision', controlname: 'EChangeVision' },
    { value: '3', label: 'Eyes pain', controlname: 'EEyePain' },
    { value: '4', label: 'Double vision', controlname: 'EDoubleVision' },
    { value: '5', label: 'Flashing lights', controlname: 'EFlashingLights' },
    { value: '6', label: 'Glaucoma/Cataracts', controlname: 'EGlaucomaCataracts' },
    { value: '7', label: 'Last eye exam', controlname: 'ELastEyeExam' },
  ];

  public earsIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Change in hearing', controlname: 'EneChangeHearing' },
    { value: '2', label: 'Tympanic Membrane', controlname: 'EneTympanicMembrane' },
    { value: '3', label: 'Ear discharge', controlname: 'EneEarDischarge' },
    { value: '4', label: 'Ringing', controlname: 'EneRinging' },
    { value: '5', label: 'Dizziness', controlname: 'EneDizziness' },
  ];

  public noseSinusesIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Nose bleeds', controlname: 'EnnNoseBleeds' },
    { value: '2', label: 'Nasal Stuffiness', controlname: 'EnnNasalStuffiness' },
    { value: '3', label: 'Nasal Flaring', controlname: 'EnnNasalFlaring' },
    { value: '4', label: 'Frequent colds', controlname: 'EnnFrequentColds' },
  ];

  public mouthIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Bleeding gums', controlname: 'EnmBleedingGums' },
    { value: '2', label: 'Sore tongue', controlname: 'EnmSoreTongue' },
  ];

  public neckIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Lumps', controlname: 'NLumps' },
    { value: '2', label: 'Swollen Glands', controlname: 'NSwollenGlands' },
    { value: '3', label: 'Goiter', controlname: 'NGoiter' },
    { value: '4', label: 'Stiffness', controlname: 'NStiffness' },
  ];

  public breastIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Lumps', controlname: 'BLumps' },
    { value: '2', label: 'Pain', controlname: 'BPain' },
    { value: '3', label: 'Nipple Discharge', controlname: 'BNippleDischarge' },
    { value: '4', label: 'Skin abnormalities', controlname: 'BSkinAbnormalities' },
  ];

  public cardiacIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Shortness of breath', controlname: 'RShortnessBreath' },
    { value: '2', label: 'Cough', controlname: 'RCough' },
    { value: '3', label: 'Wheezing', controlname: 'RWheezing' },
    { value: '4', label: 'Coughing up blood', controlname: 'RCoughingBlood' },
    { value: '5', label: 'Production of phlegm. color', controlname: 'RProductionPhlegm' },
    { value: '6', label: 'Chest pain', controlname: 'RChestPain' },
    { value: '7', label: 'Fever', controlname: 'RFever' },
    { value: '8', label: 'Night sweats', controlname: 'RNightSweats' },
    { value: '9', label: 'Blue fingers/toes', controlname: 'RBlueFingersToes' },
    { value: '10', label: 'swelling in hands/feet', controlname: 'RSwellingHandsFeet' },
    { value: '11', label: 'Bronchitis/Emphysema', controlname: 'RBronchitisEmphysema' },
    { value: '12', label: 'Heart murmur', controlname: 'RHeartMurmur' },
    { value: '13', label: 'HX of heart medication', controlname: 'RHxHeartMedication' },
    { value: '14', label: 'Skipping heart beats', controlname: 'RSkippingHeartBeats' },
  ];

  public gasIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Changes in appetite or weigth', controlname: 'GChangeAppetiteWeight' },
    { value: '2', label: 'Problems swallowing', controlname: 'GProblemsSwallowing' },
    { value: '3', label: 'Nausea', controlname: 'GNausea' },
    { value: '4', label: 'Heartburn', controlname: 'GHeartburn' },
    { value: '5', label: 'Vomiting', controlname: 'GVomiting' },
    { value: '6', label: 'Vomiting blood', controlname: 'GVomitingBlood' },
    { value: '7', label: 'Constipation', controlname: 'GConstipation' },
    { value: '8', label: 'Diarrhea', controlname: 'GDiarrhea' },
    { value: '9', label: 'Change in bowel habits', controlname: 'GChangeBowelHabits' },
    { value: '10', label: 'Abdominal pain', controlname: 'GAbdominalPain' },
    { value: '11', label: 'Excessive belching', controlname: 'GExcessiveBelching' },
    { value: '12', label: 'Excessive flatus', controlname: 'GExcessiveFlatus' },
    { value: '13', label: 'Food intolerance', controlname: 'GFoodIntolerance' },
    { value: '14', label: 'Rectal bleeding/Hemorrhoids', controlname: 'GRectalBleedingHemo' },
    { value: '15', label: 'Yellow colour skin (jaundice/hepatitis)', controlname: 'GYellowColourSkin' },
  ];

  public urinaryIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Difficulty in urination', controlname: 'UDifficultyUrination' },
    { value: '2', label: 'Pain or buring on urination', controlname: 'UPainBurningUrination' },
    { value: '3', label: 'Frequent urination at night', controlname: 'UFrequentUrinationNight' },
    { value: '4', label: 'Urgent need to urinate', controlname: 'UUrgentNeedUrinate' },
    { value: '5', label: 'Incontinence of urine', controlname: 'UIncontinenceUrine' },
    { value: '6', label: 'Dribbling', controlname: 'UDribbling' },
    { value: '7', label: 'Decreased urine stream', controlname: 'UDecreasedUrineStream' },
    { value: '8', label: 'Blood in urine', controlname: 'UBloodUrine' },
    { value: '9', label: 'UTI/Stones/Prostate infection', controlname: 'UUtiStonesProstate' },
  ];

  public peripheralVascularIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Leg cramps', controlname: 'PLegCramps' },
    { value: '2', label: 'Varicose veins', controlname: 'PVaricoseVeins' },
    { value: '3', label: 'Clot in veins', controlname: 'PClotsVeins' },
  ];

  public musculoskeletalIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Pain', controlname: 'MPain' },
    { value: '2', label: 'Swelling', controlname: 'MSwelling' },
    { value: '3', label: 'Stiffness', controlname: 'MStiffness' },
    { value: '4', label: 'Decreased joint motion', controlname: 'MDecreasedJointMotion' },
    { value: '5', label: 'Broken bone', controlname: 'MBrokenBone' },
    { value: '6', label: 'Serious sprains', controlname: 'MSeriousSprains' },
    { value: '7', label: 'Arthritis', controlname: 'MArthritis' },
    { value: '8', label: 'Gout', controlname: 'MGout' },
  ];

  public neurologicIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Headaches', controlname: 'NuHeadaches' },
    { value: '2', label: 'Seizures', controlname: 'NuSeizures' },
    { value: '3', label: 'Paralysis', controlname: 'NuParalysis' },
    { value: '4', label: 'Weakness', controlname: 'NuWeakness' },
    { value: '5', label: 'Loss of consciousness / Fainting', controlname: 'NuLossConsciousness' },
    { value: '6', label: 'Loss of muscle size', controlname: 'NuLossMuscleSize' },
    { value: '7', label: 'Muscle spasm', controlname: 'NuMuscleSpasm' },
    { value: '8', label: 'Tremor', controlname: 'NuTremor' },
    { value: '9', label: 'Involuntray movement', controlname: 'NuInvoluntaryMovement' },
    { value: '10', label: 'Numbness', controlname: 'NuNumbness' },
    { value: '11', label: 'Incoordination', controlname: 'NuIncoordination' },
    { value: '12', label: 'Feeling on "pins and needles/tingles"', controlname: 'NuFeelingPinsNeedles' },
  ];

  public hematologicIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Anemia', controlname: 'HeAnemia' },
    { value: '2', label: 'Easy bruising/bleeding', controlname: 'HeEasyBruisingBleeding' },
  ];

  public endocrineIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Abnormal growth', controlname: 'EdAbnormalGrowth' },
    { value: '2', label: 'Increased appetite', controlname: 'EdIncreasedAppetite' },
    { value: '3', label: 'Increased thirst', controlname: 'EdIncreasedThirst' },
    { value: '4', label: 'Increased urine production', controlname: 'EdIncreaseUrineProduction' },
    { value: '5', label: 'Thyroid trouble', controlname: 'EdThyroidTrouble' },
    { value: '6', label: 'eat/Cold intolerance', controlname: 'EdHeatColdIntolerance' },
    { value: '7', label: 'Excessive sweating', controlname: 'EdExcessingSweating' },
    { value: '8', label: 'Diabetes', controlname: 'EdDiabetes' },
  ];

  public psychiatricIssueList: commonKeyValuePariExt4[] = [
    { value: '1', label: 'Tension/Anxiety', controlname: 'PsTensionAnxiety' },
    { value: '2', label: 'Depression/Suicide ideation', controlname: 'PsDepressionSuicide' },
    { value: '3', label: 'Memory problems', controlname: 'PsMemoryProblems' },
    { value: '4', label: 'Past treatment with Psychiatrist', controlname: 'PsPastTreatmentPsychiatri' },
    { value: '5', label: 'Sleep problems', controlname: 'PsSleepProblems' },
    { value: '6', label: 'Unusual problems', controlname: 'PsUnusualProblems' },
    { value: '7', label: 'Change in mood / change in attitude towards family/friends', controlname: 'PsChangeMood' },
  ];

  public toAllergyArr: any = [];
  public toDiagnosisArr: any = [];
  public toVitalsArr: any = [];

  public selectedTableDetails: any;
  private paramsObject: any;
  public encounterId: any;

  public allergy: boolean = true;
  public diagnosis: boolean = false;
  public vitals: boolean = false;
  public enableCreateVitals: boolean = false;
  public enableCreateDiagnosis: boolean = false;
  public noScaleAppicable: boolean = false;
  public psychologicalHistory: boolean = false;
  public socialHistory: boolean = true;
  public noHabitApplicable: boolean = false;
  public patientDetails: Patient;
  public socialHabitList: any[];
  public maritalStatus: any;
  public documentStatus: string = '';
  public dockeyValue: any = null;
  public formDetails: any;
  public functionalAssessmentTab: boolean = true;
  public nutritionalAssessmentTab: boolean = false;

  public isNeedSupervision: boolean = true;
  public isProblemIdentify: boolean = true;
  public isUseOf: boolean = true;
  public activeReviewSystemTab: string = ''; // Track active tab label

  public nutritionalRiskesArray: any[] = [];

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  private duplicates: any = [];

  private Zversion: string;
  private ZMode: string = "I";
  private documentMode: string = "New";

  constructor(
    public storageService: StorageService,
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private _route: ActivatedRoute,
    private emergencyService: EmergencyService,
    private sharedService: SharedService,
    private dataShareService: DataShareService,
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId = this.paramsObject.einri + this.paramsObject.falnr + this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
      this.getPatinetDetails(this.encounterId);

    });

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Add$ && data.isAllow == true && data.value == '') {
          this.documentMode = ActionType.Add$;
          let checkindata: any = JSON.parse(localStorage.getItem('checkindata'));
          this.selectedTableDetails = checkindata;
          this.patchForm();
        }
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          this.documentMode = ActionType.Update$;
          if (data.value.type == WordType.EditEND && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.Zversion = data.value.latest.Zversion;
              this.ZMode = 'U';
              this.statusDraftDocDetails(this.dockeyValue);
              this.getSocialHistoryHabitList();
            }
          }
        } else if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
          this.documentMode = ActionType.Copy$;
          if (data.value.type == WordType.CopyBS && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.getSocialHistoryHabitList();
              // this.getBradenScaleDetails(data.value.docKey);
            }
          }
        } else {

        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
    this.selectedTableDetails = "";
  }

  ngOnInit(): void {
    // this.initForm();
    this.changeReviewofSystem('Skin');

    this.triageForm.get('noProblemIdentifySelfCaring').valueChanges.subscribe((value) => {
      const selectControl1 = this.triageForm.get('FunFeeding');
      const selectControl2 = this.triageForm.get('FunHygiene');
      const selectControl3 = this.triageForm.get('FunToileting');
      const selectControl4 = this.triageForm.get('FunAmulation');
      if (value) {
        selectControl1.patchValue(false); // Enable ng-select when checkbox is checked
        selectControl2.patchValue(false); // Enable ng-select when checkbox is checked
        selectControl3.patchValue(false); // Enable ng-select when checkbox is checked
        selectControl4.patchValue(false); // Enable ng-select when checkbox is checked
      }
    });

    this.triageForm.get('noProblemIdentifyMuscu').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('problemIdenfifyMuscuOption');
      if (value) {
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      }
    });

    this.triageForm.get('noEquipment').valueChanges.subscribe((value) => {
      const selectControl1 = this.triageForm.get('usedEquipmentsOption');
      const selectControl2 = this.triageForm.get('usedEquipmentsOtherOpt');
      if (value) {
        selectControl1.patchValue(''); // Enable ng-select when checkbox is checked
        selectControl2.patchValue(''); // Enable ng-select when checkbox is checked
      }
    });

    this.triageForm.get('needSuperVisionTotalDependent').valueChanges.subscribe((value) => {
      const selectControl1 = this.triageForm.get('FunFeeding');
      const selectControl2 = this.triageForm.get('FunHygiene');
      const selectControl3 = this.triageForm.get('FunToileting');
      const selectControl4 = this.triageForm.get('FunAmulation');
      if (value) {
        selectControl1.enable(); // Enable ng-select when checkbox is checked
        selectControl2.enable(); // Enable ng-select when checkbox is checked
        selectControl3.enable(); // Enable ng-select when checkbox is checked
        selectControl4.enable(); // Enable ng-select when checkbox is checked
      } else {
        selectControl1.disable(); // Disable ng-select when checkbox is unchecked
        selectControl2.disable(); // Disable ng-select when checkbox is unchecked
        selectControl3.disable(); // Disable ng-select when checkbox is unchecked
        selectControl4.disable(); // Disable ng-select when checkbox is unchecked
      }
    });


    this.triageForm.get('problemIdenfifyMuscu').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('problemIdenfifyMuscuOption');
      if (value) {
        selectControl.enable(); // Enable ng-select when checkbox is checked
      } else {
        selectControl.disable(); // Disable ng-select when checkbox is unchecked
      }
    });

    this.triageForm.get('usedEquipments').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('usedEquipmentsOption');
      if (value) {
        selectControl.enable(); // Enable ng-select when checkbox is checked
      } else {
        selectControl.disable(); // Disable ng-select when checkbox is unchecked
      }
    });

    this.triageForm.get('AppetiteValue').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('AppetiteOtherValue');
      if (value == 4) {
        selectControl.enable(); // Enable ng-select when checkbox is checked
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      } else {
        selectControl.disable(); // Disable ng-select when checkbox is unchecked
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      }
    });

    this.triageForm.get('generalApperenceValue').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('generalApperenceOtherValue');
      if (value == 4) {
        selectControl.enable(); // Enable ng-select when checkbox is checked
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      } else {
        selectControl.disable(); // Disable ng-select when checkbox is unchecked
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      }
    });

    this.triageForm.get('nutritionalSupportValue').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('nutritionalSupportOtherValue');
      if (value == 4) {
        selectControl.enable(); // Enable ng-select when checkbox is checked
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      } else {
        selectControl.disable(); // Disable ng-select when checkbox is unchecked
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      }
    });

    this.triageForm.get('dietValue').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('dietOtherValue');
      if (value == 3) {
        selectControl.enable(); // Enable ng-select when checkbox is checked
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      } else {
        selectControl.disable(); // Disable ng-select when checkbox is unchecked
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      }
    });

    this.triageForm.get('feedingDefficultiesValue').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('feedingDefficultiesOtherValue');
      if (value == 5) {
        selectControl.enable(); // Enable ng-select when checkbox is checked
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      } else {
        selectControl.disable(); // Disable ng-select when checkbox is unchecked
        selectControl.patchValue(''); // Enable ng-select when checkbox is checked
      }
    });

    this.triageForm.get('CannotAssessedReview').valueChanges.subscribe((value) => {
      console.log('Test');
      const textListIndCheckControlsToDisable = ['STypeRash', 'HHeadCircumference', 'EnmLipColor', 'GToiletTrained', 'GTfreq', 'GUsesDiaper', 'GUfreq'];

      const checkboxControlsToDisable = [
        'SNoReportedAbnorm', 'HNoReportedAbnorm',
        'ENoReportedAbnorm', 'EneNoReportedAbnorma', 'EnnNoReportedAbnorm',
        'EnmNoReportedAbnorm', 'NNoReportedAbnorm', 'BNoReportedAbnorm',
        'RNoReportedAbnorm', 'GNoReportedAbnorm', 'UNoReportedAbnorm',
        'PNoReportedAbnorm', 'MNoReportedAbnorm',
        'NuNoReportedAbnorm', 'HeNoReportedAbnorm', 'EdNoReportedAbnorm',
        'PsNoReportedAbnorm'
      ];

      const disableCheckboxLists = [
        this.skinIssueList, this.headIssueList, this.eyesIssueList, this.earsIssueList,
        this.noseSinusesIssueList, this.mouthIssueList, this.neckIssueList, this.breastIssueList,
        this.cardiacIssueList, this.gasIssueList, this.urinaryIssueList, this.peripheralVascularIssueList,
        this.musculoskeletalIssueList, this.neurologicIssueList, this.hematologicIssueList,
        this.endocrineIssueList, this.psychiatricIssueList
      ];

      if (value) {
        checkboxControlsToDisable.forEach(controlName => {
          const control = this.triageForm.get(controlName);
          if (control) {
            control.disable();
            control.setValue(false);
          }
        });

        disableCheckboxLists.forEach(list => {
          list.forEach(item => {
            const control = this.triageForm.get(item.controlname);
            if (control) {
              control.disable();
              control.setValue(false);
            }
          });
        });

        textListIndCheckControlsToDisable.forEach((item) => {
          const selectControl = this.triageForm.get(item);
          if (selectControl) {
            selectControl.disable();
            selectControl.setValue('');
          }
        })
      } else {
        checkboxControlsToDisable.forEach(controlName => {
          const control = this.triageForm.get(controlName);
          if (control) {
            control.enable();
          }
        });

        disableCheckboxLists.forEach(list => {
          list.forEach(item => {
            const control = this.triageForm.get(item.controlname);
            if (control) {
              control.enable();
            }
          });
        });

        textListIndCheckControlsToDisable.forEach((item) => {
          const selectControl = this.triageForm.get(item);
          if (selectControl) {
            selectControl.enable();
          }
        });
      }
    });

    this.handleControlChanges('SNoReportedAbnorm', this.skinIssueList, ['STypeRash']);
    this.handleControlChanges('HNoReportedAbnorm', this.headIssueList, ['HHeadCircumference']);
    this.handleControlChanges('ENoReportedAbnorm', this.eyesIssueList, []);

    this.handleControlChanges('EneNoReportedAbnorma', this.earsIssueList, []);
    this.handleControlChanges('EnnNoReportedAbnorm', this.noseSinusesIssueList, []);
    this.handleControlChanges('EnmNoReportedAbnorm', this.mouthIssueList, ['EnmLipColor']);

    this.handleControlChanges('NNoReportedAbnorm', this.neckIssueList, []);
    this.handleControlChanges('BNoReportedAbnorm', this.breastIssueList, []);
    this.handleControlChanges('RNoReportedAbnorm', this.cardiacIssueList, []);
    this.handleControlChanges('GNoReportedAbnorm', this.gasIssueList, ['GToiletTrained', 'GTfreq', 'GUsesDiaper', 'GUfreq']);
    this.handleControlChanges('UNoReportedAbnorm', this.urinaryIssueList, []);

    this.handleControlChanges('PNoReportedAbnorm', this.peripheralVascularIssueList, []);
    this.handleControlChanges('MNoReportedAbnorm', this.musculoskeletalIssueList, []);
    this.handleControlChanges('NuNoReportedAbnorm', this.neurologicIssueList, []);

    this.handleControlChanges('HeNoReportedAbnorm', this.hematologicIssueList, []);
    this.handleControlChanges('EdNoReportedAbnorm', this.endocrineIssueList, []);
    this.handleControlChanges('PsNoReportedAbnorm', this.psychiatricIssueList, []);
  }

  // Define a function to handle the subscription and action logic
  private handleControlChanges(controlName: string, issueList: any[], relatedControlName?: string[]): void {
    console.log('Test');
    if (this.triageForm.contains(controlName)) {
      this.triageForm.get(controlName).valueChanges.subscribe((value) => {
        if (value) {
          // Disable all checkbox controls related to the issue
          issueList.forEach((item) => {
            const control = this.triageForm.get(item.controlname);
            if (control) {
              control.disable();
              control.setValue(false); // Reset checkbox value
            }
          });
          if (relatedControlName.length > 0) {
            relatedControlName.forEach((item) => {
              const selectControl = this.triageForm.get(item);
              if (selectControl) {
                selectControl.disable();
                selectControl.setValue('');
              }
            })
          }
        } else {
          // Enable all checkbox controls related to the issue
          issueList.forEach((item) => {
            const control = this.triageForm.get(item.controlname);
            if (control) {
              control.enable();
            }
          });
          if (relatedControlName.length > 0) {
            relatedControlName.forEach((item) => {
              const selectControl = this.triageForm.get(item);
              if (selectControl) {
                selectControl.enable();
              }
            })
          }
        }
      });
    } else {
      console.error(`Control ${controlName} does not exist in triageForm.`);
    }

  }




  public initForm(triageValue?: any) {
    this.triageForm = this.formBuilder.group({
      Dockey: new FormControl(), // Initialize with empty string
      Dtid: new FormControl(),// Initialize with default value 'ZMED_TRASM'
      Einri: new FormControl(), // Initialize with storageService.einri or empty
      Patnr: new FormControl(), // Initialize with storageService.patnr or empty
      Falnr: new FormControl(), // Initialize with storageService.falnr or empty
      Lfdnr: new FormControl(), // Initialize with storageService.lfdnr or empty
      Orgdo: new FormControl(), // Initialize with default value 'EMEMDAMC'
      ArrivalMode: new FormControl(),// Initialize with empty string
      ArrivalModeTxt: new FormControl(), // Initialize with empty string
      Accompanied: new FormControl(), // Initialize with empty string
      AccompaniedTxt: new FormControl(), // Initialize with empty string
      Language: new FormControl(), // Initialize with default value 'English'
      TriagePriority: new FormControl(),// Initialize with selectedTableDetails.TriagePriorityCode or undefined
      ArrivalTime: new FormControl(),// Initialize with parsed time or undefined
      ChiefComplaint: [''], // Initialize with empty string
      PsyNoProblem: [false], // Initialize with false
      PsyAnxious: [false], // Initialize with false
      PsyUncooperative: [false], // Initialize with false
      PsyDepressed: [false], // Initialize with false
      PsyAngry: new FormControl(), // Initialize with false
      PsyAgitated: new FormControl(), // Initialize with false
      PsyCombative: new FormControl(), // Initialize with false
      PsyOther: new FormControl(), // Initialize with false
      PsyComments: new FormControl(), // Initialize with empty string
      AttendPhy: [this.storageService.getGpart()], // Initialize with storageService.getGpart() or undefined
      noProblemIdentifySelfCaring: new FormControl(),
      noProblemIdentifyMuscu: new FormControl(),
      needSuperVisionTotalDependent: new FormControl(),
      needSuperVisionTotalDependentOption: new FormControl(),
      problemIdenfifyMuscu: new FormControl(),
      problemIdenfifyMuscuOption: new FormControl(),
      noEquipment: new FormControl(),
      usedEquipments: new FormControl(),
      usedEquipmentsOption: new FormControl(),
      usedEquipmentsOtherOpt: new FormControl(),
      drNotificationOption: new FormControl(),
      notifiedOption: new FormControl(),
      nutritionalRiskes: new FormControl(),
      nutritionalRiskScore: new FormControl(),
      nutritionalRiskValue: new FormControl(),
      AppetiteValue: new FormControl(),
      AppetiteOtherValue: new FormControl(),
      generalApperenceValue: new FormControl(),
      generalApperenceOtherValue: new FormControl(),
      nutritionalSupportValue: new FormControl(),
      nutritionalSupportOtherValue: new FormControl(),
      dietValue: new FormControl(),
      dietOtherValue: new FormControl(),
      feedingDefficultiesValue: new FormControl(),
      feedingDefficultiesOtherValue: new FormControl(),
      drNotificationOptionNutri: new FormControl(),
      notifiedOptionNutri: new FormControl(),
      nutriComment: new FormControl(),
      wightOneMonth: new FormControl(),
      wightThreeMonth: new FormControl(),
      bmi: new FormControl(),

      CannotAssessedReview: new FormControl(),
      SNoReportedAbnorm: new FormControl(),
      SRashes: new FormControl(),
      SItching: new FormControl(),
      SChangeHairNails: new FormControl(),
      STypeRash: new FormControl(),
      SComments: new FormControl(),


      HNoReportedAbnorm: new FormControl(),
      HHeadInjury: new FormControl(),
      HHeadCircumference: new FormControl(),
      HComments: new FormControl(),

      ENoReportedAbnorm: new FormControl(),
      EGlassesContacts: new FormControl(),
      EChangeVision: new FormControl(),
      EEyePain: new FormControl(),
      EDoubleVision: new FormControl(),
      EFlashingLights: new FormControl(),
      EGlaucomaCataracts: new FormControl(),
      ELastEyeExam: new FormControl(),
      EComments: new FormControl(),

      EneNoReportedAbnorma: new FormControl(),
      EneChangeHearing: new FormControl(),
      EneTympanicMembrane: new FormControl(),
      EneEarDischarge: new FormControl(),
      EneRinging: new FormControl(),
      EneDizziness: new FormControl(),

      EnnNoReportedAbnorm: new FormControl(),
      EnnNoseBleeds: new FormControl(),
      EnnNasalStuffiness: new FormControl(),
      EnnNasalFlaring: new FormControl(),
      EnnFrequentColds: new FormControl(),

      EnmNoReportedAbnorm: new FormControl(),
      EnmBleedingGums: new FormControl(),
      EnmSoreTongue: new FormControl(),
      EnmLipColor: new FormControl(),
      EnmComments: new FormControl(),

      NNoReportedAbnorm: new FormControl(),
      NLumps: new FormControl(),
      NSwollenGlands: new FormControl(),
      NGoiter: new FormControl(),
      NStiffness: new FormControl(),
      NComments: new FormControl(),

      BNoReportedAbnorm: new FormControl(),
      BLumps: new FormControl(),
      BPain: new FormControl(),
      BNippleDischarge: new FormControl(),
      BSkinAbnormalities: new FormControl(),
      BComments: new FormControl(),

      RNoReportedAbnorm: new FormControl(),
      RShortnessBreath: new FormControl(),
      RCough: new FormControl(),
      RWheezing: new FormControl(),
      RCoughingBlood: new FormControl(),
      RProductionPhlegm: new FormControl(),
      RChestPain: new FormControl(),
      RFever: new FormControl(),
      RNightSweats: new FormControl(),
      RBlueFingersToes: new FormControl(),
      RSwellingHandsFeet: new FormControl(),
      RBronchitisEmphysema: new FormControl(),
      RHeartMurmur: new FormControl(),
      RHxHeartMedication: new FormControl(),
      RSkippingHeartBeats: new FormControl(),
      RComments: new FormControl(),

      GNoReportedAbnorm: new FormControl(),
      GChangeAppetiteWeight: new FormControl(),
      GProblemsSwallowing: new FormControl(),
      GNausea: new FormControl(),
      GHeartburn: new FormControl(),
      GVomiting: new FormControl(),
      GVomitingBlood: new FormControl(),
      GConstipation: new FormControl(),
      GDiarrhea: new FormControl(),
      GChangeBowelHabits: new FormControl(),
      GAbdominalPain: new FormControl(),
      GExcessiveBelching: new FormControl(),
      GExcessiveFlatus: new FormControl(),
      GFoodIntolerance: new FormControl(),
      GRectalBleedingHemo: new FormControl(),
      GYellowColourSkin: new FormControl(),
      GToiletTrained: new FormControl(),
      GTfreq: new FormControl(),
      GUsesDiaper: new FormControl(),
      GUfreq: new FormControl(),
      GComments: new FormControl(),

      UNoReportedAbnorm: new FormControl(),
      UDifficultyUrination: new FormControl(),
      UPainBurningUrination: new FormControl(),
      UFrequentUrinationNight: new FormControl(),
      UUrgentNeedUrinate: new FormControl(),
      UIncontinenceUrine: new FormControl(),
      UDribbling: new FormControl(),
      UDecreasedUrineStream: new FormControl(),
      UBloodUrine: new FormControl(),
      UUtiStonesProstate: new FormControl(),
      UComments: new FormControl(),

      PNoReportedAbnorm: new FormControl(),
      PLegCramps: new FormControl(),
      PVaricoseVeins: new FormControl(),
      PClotsVeins: new FormControl(),
      PComments: new FormControl(),

      MNoReportedAbnorm: new FormControl(),
      MPain: new FormControl(),
      MSwelling: new FormControl(),
      MDecreasedJointMotion: new FormControl(),
      msStiffness: new FormControl(),
      MBrokenBone: new FormControl(),
      MSeriousSprains: new FormControl(),
      MArthritis: new FormControl(),
      MGout: new FormControl(),
      MComments: new FormControl(),

      NuNoReportedAbnorm: new FormControl(),
      NuHeadaches: new FormControl(),
      NuSeizures: new FormControl(),
      NuParalysis: new FormControl(),
      NuWeakness: new FormControl(),
      NuLossConsciousness: new FormControl(),
      NuLossMuscleSize: new FormControl(),
      NuMuscleSpasm: new FormControl(),
      NuTremor: new FormControl(),
      NuInvoluntaryMovement: new FormControl(),
      NuIncoordination: new FormControl(),
      NuNumbness: new FormControl(),
      NuFeelingPinsNeedles: new FormControl(),
      NuComments: new FormControl(),

      HeNoReportedAbnorm: new FormControl(),
      HeAnemia: new FormControl(),
      HeEasyBruisingBleeding: new FormControl(),
      HeComments: new FormControl(),


      EdNoReportedAbnorm: new FormControl(),
      EdAbnormalGrowth: new FormControl(),
      EdIncreasedAppetite: new FormControl(),
      EdIncreasedThirst: new FormControl(),
      EdIncreaseUrineProduction: new FormControl(),
      EdThyroidTrouble: new FormControl(),
      EdHeatColdIntolerance: new FormControl(),
      EdExcessingSweating: new FormControl(),
      EdDiabetes: new FormControl(),
      EdComments: new FormControl(),

      PsNoReportedAbnorm: new FormControl(),
      PsTensionAnxiety: new FormControl(),
      PsDepressionSuicide: new FormControl(),
      PsMemoryProblems: new FormControl(),
      PsPastTreatmentPsychiatri: new FormControl(),
      PsSleepProblems: new FormControl(),
      PsUnusualProblems: new FormControl(),
      PsChangeMood: new FormControl(),
      PsComments: new FormControl(),


      DocStatus: ['1'], // Initialize with default value '1'
    });

  }

  private patchForm(triageValue?: any) {
    if (this.documentMode == ActionType.Add$) {
      this.triageForm = this.formBuilder.group({
        Dockey: [''], // Initialize with empty string
        Dtid: ['ZMED_TRASM'], // Initialize with default value 'ZMED_TRASM'
        Einri: [this.paramsObject.einri], // Initialize with storageService.einri or empty
        Patnr: [this.paramsObject.patnr], // Initialize with storageService.patnr or empty
        Falnr: [this.paramsObject.falnr], // Initialize with storageService.falnr or empty
        Lfdnr: [this.paramsObject.lfdnr], // Initialize with storageService.lfdnr or empty
        Orgdo: ['EMEMDAMC'], // Initialize with default value 'EMEMDAMC'
        ArrivalMode: [''], // Initialize with empty string
        ArrivalModeTxt: [''], // Initialize with empty string
        Accompanied: [''], // Initialize with empty string
        AccompaniedTxt: [''], // Initialize with empty string
        Language: ['English'], // Initialize with default value 'English'
        TriagePriority: [this.documentMode == ActionType.Add$ ? this.selectedTableDetails.TriagePriorityCode : ''], // Initialize with selectedTableDetails.TriagePriorityCode or undefined
        ArrivalTime: [this.parseTime(this.selectedTableDetails?.ZeitIntern)], // Initialize with parsed time or undefined
        ChiefComplaint: [''], // Initialize with empty string
        PsyNoProblem: [false], // Initialize with false
        PsyAnxious: [false], // Initialize with false
        PsyUncooperative: [false], // Initialize with false
        PsyDepressed: [false], // Initialize with false
        PsyAngry: [false], // Initialize with false
        PsyAgitated: [false], // Initialize with false
        PsyCombative: [false], // Initialize with false
        PsyOther: [false], // Initialize with false
        PsyComments: [''], // Initialize with empty string
        AttendPhy: [this.storageService.getGpart()], // Initialize with storageService.getGpart() or undefined

        noProblemIdentifySelfCaring: [{ value: false, disabled: false }],
        needSuperVisionTotalDependent: [{ value: false, disabled: false }],
        needSuperVisionTotalDependentOption: [{ value: '', disabled: true }],
        FunFeeding: [{ value: '', disabled: true }],
        FunHygiene: [{ value: '', disabled: true }],
        FunToileting: [{ value: '', disabled: true }],
        FunAmulation: [{ value: '', disabled: true }],

        noProblemIdentifyMuscu: [{ value: false, disabled: false }],
        problemIdenfifyMuscu: [{ value: false, disabled: false }],
        problemIdenfifyMuscuOption: [{ value: '', disabled: true }],

        noEquipment: [{ value: false, disabled: false }],
        usedEquipments: [{ value: false, disabled: false }],
        usedEquipmentsOption: [{ value: '', disabled: true }],
        usedEquipmentsOtherOpt: [{ value: '', disabled: true }],

        drNotificationOption: [{ value: '', disabled: false }],
        notifiedOption: [{ value: '', disabled: false }],

        // nutritionalRiskes: [{ value: '', disabled: false }],
        nrPregnancy: [{ value: '', disabled: false }],
        nrUnderweight: [{ value: '', disabled: false }],
        nrMalnutrition: [{ value: '', disabled: false }],
        nrRenaldiseasehepatitis: [{ value: '', disabled: false }],
        nrHtn: [{ value: '', disabled: false }],
        nrCopd: [{ value: '', disabled: false }],
        nrChf: [{ value: '', disabled: false }],
        nrCad: [{ value: '', disabled: false }],
        nrEatingdisorder: [{ value: '', disabled: false }],
        nrFoodallergies: [{ value: '', disabled: false }],
        nrChewingProblem: [{ value: '', disabled: false }],
        nrChronicConstipation: [{ value: '', disabled: false }],
        nrVomitting: [{ value: '', disabled: false }],
        nrDiarrhea: [{ value: '', disabled: false }],
        nrDiabetes: [{ value: '', disabled: false }],
        nrHiv: [{ value: '', disabled: false }],
        nrGidisorder: [{ value: '', disabled: false }],
        nrLowalbumin: [{ value: '', disabled: false }],



        nutritionalRiskScore: [{ value: '0', disabled: true }],
        nutritionalRiskValue: [{ value: 'No Risk', disabled: true }],

        AppetiteValue: [{ value: '', disabled: false }],
        AppetiteOtherValue: [{ value: '', disabled: true }],

        generalApperenceValue: [{ value: '', disabled: false }],
        generalApperenceOtherValue: [{ value: '', disabled: true }],
        nutritionalSupportValue: [{ value: '', disabled: false }],
        nutritionalSupportOtherValue: [{ value: '', disabled: true }],
        dietValue: [{ value: '', disabled: false }],
        dietOtherValue: [{ value: '', disabled: true }],
        feedingDefficultiesValue: [{ value: '', disabled: false }],
        feedingDefficultiesOtherValue: [{ value: '', disabled: true }],

        drNotificationOptionNutri: [{ value: '', disabled: false }],
        notifiedOptionNutri: [{ value: '', disabled: false }],

        wightOneMonth: [{ value: '', disabled: false }],
        wightThreeMonth: [{ value: '', disabled: false }],
        bmi: [{ value: '', disabled: false }],

        nutriComment: [{ value: '', disabled: false }],



        CannotAssessedReview: [{ value: '', disabled: false }],
        SNoReportedAbnorm: [{ value: '', disabled: false }],
        SRashes: [{ value: '', disabled: false }],
        SItching: [{ value: '', disabled: false }],
        SChangeHairNails: [{ value: '', disabled: false }],
        STypeRash: [{ value: '', disabled: false }],
        SComments: [{ value: '', disabled: false }],

        HNoReportedAbnorm: [{ value: '', disabled: false }],
        HHeadInjury: [{ value: '', disabled: false }],
        HHeadCircumference: [{ value: '', disabled: false }],
        HComments: [{ value: '', disabled: false }],

        ENoReportedAbnorm: [{ value: '', disabled: false }],
        EGlassesContacts: [{ value: '', disabled: false }],
        EChangeVision: [{ value: '', disabled: false }],
        EEyePain: [{ value: '', disabled: false }],
        EDoubleVision: [{ value: '', disabled: false }],
        EFlashingLights: [{ value: '', disabled: false }],
        EGlaucomaCataracts: [{ value: '', disabled: false }],
        ELastEyeExam: [{ value: '', disabled: false }],
        EComments: [{ value: '', disabled: false }],

        EneNoReportedAbnorma: [{ value: '', disabled: false }],
        EneChangeHearing: [{ value: '', disabled: false }],
        EneTympanicMembrane: [{ value: '', disabled: false }],
        EneEarDischarge: [{ value: '', disabled: false }],
        EneRinging: [{ value: '', disabled: false }],
        EneDizziness: [{ value: '', disabled: false }],

        EnnNoReportedAbnorm: [{ value: '', disabled: false }],
        EnnNoseBleeds: [{ value: '', disabled: false }],
        EnnNasalStuffiness: [{ value: '', disabled: false }],
        EnnNasalFlaring: [{ value: '', disabled: false }],
        EnnFrequentColds: [{ value: '', disabled: false }],

        EnmNoReportedAbnorm: [{ value: '', disabled: false }],
        EnmBleedingGums: [{ value: '', disabled: false }],
        mtSoretongue: [{ value: '', disabled: false }],
        EnmSoreTongue: [{ value: '', disabled: false }],
        EnmLipColor: [{ value: '', disabled: false }],
        EnmComments: [{ value: '', disabled: false }],

        NNoReportedAbnorm: [{ value: '', disabled: false }],
        NLumps: [{ value: '', disabled: false }],
        NSwollenGlands: [{ value: '', disabled: false }],
        NGoiter: [{ value: '', disabled: false }],
        NStiffness: [{ value: '', disabled: false }],
        NComments: [{ value: '', disabled: false }],

        BNoReportedAbnorm: [{ value: '', disabled: false }],
        BLumps: [{ value: '', disabled: false }],
        BPain: [{ value: '', disabled: false }],
        BNippleDischarge: [{ value: '', disabled: false }],
        BSkinAbnormalities: [{ value: '', disabled: false }],
        BComments: [{ value: '', disabled: false }],

        RNoReportedAbnorm: [{ value: '', disabled: false }],
        RShortnessBreath: [{ value: '', disabled: false }],
        RCough: [{ value: '', disabled: false }],
        RWheezing: [{ value: '', disabled: false }],
        RCoughingBlood: [{ value: '', disabled: false }],
        RProductionPhlegm: [{ value: '', disabled: false }],
        RChestPain: [{ value: '', disabled: false }],
        RFever: [{ value: '', disabled: false }],
        RNightSweats: [{ value: '', disabled: false }],
        RBlueFingersToes: [{ value: '', disabled: false }],
        RSwellingHandsFeet: [{ value: '', disabled: false }],
        RBronchitisEmphysema: [{ value: '', disabled: false }],
        RHxHeartMedication: [{ value: '', disabled: false }],
        RSkippingHeartBeats: [{ value: '', disabled: false }],
        RHeartMurmur: [{ value: '', disabled: false }],
        RComments: [{ value: '', disabled: false }],

        GNoReportedAbnorm: [{ value: '', disabled: false }],
        GChangeAppetiteWeight: [{ value: '', disabled: false }],
        GProblemsSwallowing: [{ value: '', disabled: false }],
        GNausea: [{ value: '', disabled: false }],
        GHeartburn: [{ value: '', disabled: false }],
        GVomiting: [{ value: '', disabled: false }],
        GVomitingBlood: [{ value: '', disabled: false }],
        GConstipation: [{ value: '', disabled: false }],
        GDiarrhea: [{ value: '', disabled: false }],
        GChangeBowelHabits: [{ value: '', disabled: false }],
        GAbdominalPain: [{ value: '', disabled: false }],
        GExcessiveBelching: [{ value: '', disabled: false }],
        GExcessiveFlatus: [{ value: '', disabled: false }],
        GFoodIntolerance: [{ value: '', disabled: false }],
        GRectalBleedingHemo: [{ value: '', disabled: false }],
        GYellowColourSkin: [{ value: '', disabled: false }],
        GToiletTrained: [{ value: '', disabled: false }],
        GTfreq: [{ value: '', disabled: false }],
        GUsesDiaper: [{ value: '', disabled: false }],
        GUfreq: [{ value: '', disabled: false }],
        GComments: [{ value: '', disabled: false }],

        UNoReportedAbnorm: [{ value: '', disabled: false }],
        UDifficultyUrination: [{ value: '', disabled: false }],
        UPainBurningUrination: [{ value: '', disabled: false }],
        UFrequentUrinationNight: [{ value: '', disabled: false }],
        UUrgentNeedUrinate: [{ value: '', disabled: false }],
        UIncontinenceUrine: [{ value: '', disabled: false }],
        UDribbling: [{ value: '', disabled: false }],
        UDecreasedUrineStream: [{ value: '', disabled: false }],
        UBloodUrine: [{ value: '', disabled: false }],
        UUtiStonesProstate: [{ value: '', disabled: false }],
        UComments: [{ value: '', disabled: false }],

        PNoReportedAbnorm: [{ value: '', disabled: false }],
        PLegCramps: [{ value: '', disabled: false }],
        PVaricoseVeins: [{ value: '', disabled: false }],
        PClotsVeins: [{ value: '', disabled: false }],
        PComments: [{ value: '', disabled: false }],

        MNoReportedAbnorm: [{ value: '', disabled: false }],
        MPain: [{ value: '', disabled: false }],
        MSwelling: [{ value: '', disabled: false }],
        MStiffness: [{ value: '', disabled: false }],
        MDecreasedJointMotion: [{ value: '', disabled: false }],
        MBrokenBone: [{ value: '', disabled: false }],
        MSeriousSprains: [{ value: '', disabled: false }],
        MArthritis: [{ value: '', disabled: false }],
        MGout: [{ value: '', disabled: false }],
        MComments: [{ value: '', disabled: false }],

        NuNoReportedAbnorm: [{ value: '', disabled: false }],
        NuHeadaches: [{ value: '', disabled: false }],
        NuSeizures: [{ value: '', disabled: false }],
        NuParalysis: [{ value: '', disabled: false }],
        NuWeakness: [{ value: '', disabled: false }],
        NuLossConsciousness: [{ value: '', disabled: false }],
        NuLossMuscleSize: [{ value: '', disabled: false }],
        NuMuscleSpasm: [{ value: '', disabled: false }],
        NuTremor: [{ value: '', disabled: false }],
        NuInvoluntaryMovement: [{ value: '', disabled: false }],
        NuNumbness: [{ value: '', disabled: false }],
        NuIncoordination: [{ value: '', disabled: false }],
        NuFeelingPinsNeedles: [{ value: '', disabled: false }],
        NuComments: [{ value: '', disabled: false }],

        HeNoReportedAbnorm: [{ value: '', disabled: false }],
        HeAnemia: [{ value: '', disabled: false }],
        HeEasyBruisingBleeding: [{ value: '', disabled: false }],
        HeComments: [{ value: '', disabled: false }],


        EdNoReportedAbnorm: [{ value: '', disabled: false }],
        EdAbnormalGrowth: [{ value: '', disabled: false }],
        EdIncreasedAppetite: [{ value: '', disabled: false }],
        EdIncreasedThirst: [{ value: '', disabled: false }],
        EdIncreaseUrineProduction: [{ value: '', disabled: false }],
        EdThyroidTrouble: [{ value: '', disabled: false }],
        EdHeatColdIntolerance: [{ value: '', disabled: false }],
        EdExcessingSweating: [{ value: '', disabled: false }],
        EdDiabetes: [{ value: '', disabled: false }],
        EdComments: [{ value: '', disabled: false }],

        PsNoReportedAbnorm: [{ value: '', disabled: false }],
        PsTensionAnxiety: [{ value: '', disabled: false }],
        PsDepressionSuicide: [{ value: '', disabled: false }],
        PsMemoryProblems: [{ value: '', disabled: false }],
        PsPastTreatmentPsychiatri: [{ value: '', disabled: false }],
        PsSleepProblems: [{ value: '', disabled: false }],
        PsUnusualProblems: [{ value: '', disabled: false }],
        PsChangeMood: [{ value: '', disabled: false }],
        PsComments: [{ value: '', disabled: false }],

        DocStatus: [{ value: '1', disabled: false }],
      });
    } else {
      this.triageForm = this.formBuilder.group({
        Dockey: triageValue?.Dockey ? triageValue?.Dockey : '',
        Dtid: triageValue?.Dtid ? triageValue?.Dtid : 'ZMED_TRASM',
        Einri: triageValue?.Einri ? triageValue?.Einri : this.paramsObject.einri,
        Patnr: triageValue?.Patnr ? triageValue?.Patnr : this.paramsObject.patnr,
        Falnr: triageValue?.Falnr ? triageValue?.Falnr : this.paramsObject.falnr,
        Lfdnr: triageValue?.Lfdnr ? triageValue?.Lfdnr : this.paramsObject.lfdnr,
        Orgdo: triageValue?.Orgdo ? triageValue?.Orgdo : 'EMEMDAMC',
        ArrivalMode: triageValue?.ArrivalMode ? triageValue?.ArrivalMode : '',
        ArrivalModeTxt: triageValue?.ArrivalModeTxt ? triageValue?.ArrivalModeTxt : '',
        Accompanied: triageValue?.Accompanied ? triageValue?.Accompanied : '',
        AccompaniedTxt: triageValue?.AccompaniedTxt ? triageValue?.AccompaniedTxt : '',
        Language: triageValue?.Language ? triageValue?.Language : 'English',
        TriagePriority: triageValue?.TriagePriority ? triageValue?.TriagePriority : this.selectedTableDetails.TriagePriorityCode,
        ArrivalTime: triageValue?.ArrivalTime ? this.parseTime(triageValue?.ArrivalTime) : this.parseTime(this.selectedTableDetails.ZeitIntern),
        ChiefComplaint: triageValue?.ChiefComplaint ? triageValue?.ChiefComplaint : '',
        PsyNoProblem: triageValue?.PsyNoProblem ? triageValue?.PsyNoProblem : false,
        PsyAnxious: triageValue?.PsyAnxious ? triageValue?.PsyAnxious : false,
        PsyUncooperative: triageValue?.PsyUncooperative ? triageValue?.PsyUncooperative : false,
        PsyDepressed: triageValue?.PsyDepressed ? triageValue?.PsyDepressed : false,
        PsyAngry: triageValue?.PsyAngry ? triageValue?.PsyAngry : false,
        PsyAgitated: triageValue?.PsyAgitated ? triageValue?.PsyAgitated : false,
        PsyCombative: triageValue?.PsyCombative ? triageValue?.PsyCombative : false,
        PsyOther: triageValue?.PsyOther ? triageValue?.PsyOther : false,
        PsyComments: triageValue?.PsyComments ? triageValue?.PsyComments : '',
        AttendPhy: triageValue?.AttendPhy ? triageValue?.AttendPhy : this.storageService.getGpart(),
        noProblemIdentifySelfCaring: [false],
        noProblemIdentifyMuscu: [false],
        needSuperVisionTotalDependent: [false],
        problemIdenfifyMuscu: [false],
        problemIdenfifyMuscuOption: ['Deformities'],
        noEquipment: [false],
        usedEquipments: [false],
        usedEquipmentsOption: [''],
        usedEquipmentsOtherOpt: [''],
        drNotificationOption: [''],
        notifiedOption: [''],
        DocStatus: ['1'],
      });
    }
  }

  public statusDraftDocDetails(docKey) {
    // Subscribe using an object to define handlers
    this.emergencyService.getTriageDataIfStatusDraftForDetails(docKey).subscribe({
      next: (res: any) => {
        // Handle successful data retrieval
        this.formDetails = res?.d?.results[0];
      },
      error: (error: any) => {
        // Handle errors if the request fails
        this.sharedService.waringSwallModel(`POST Error at braden scale : ${error?.error?.error?.message?.value}`);
      },
      complete: () => {
        // Handle completion (optional), invoked when the observable completes
        // resolve(true); // Resolve the promise with formValue
        this.patchForm(this.formDetails);
        this.toAllergyArr = this.formDetails.TOALLERGIES?.results;
        this.toVitalsArr = this.formDetails.TOVITALSIGNS.results;
        this.formDetails.TOSCALE.results.forEach((element) => {
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
      }
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

  public getPatinetDetails(encounterId) {
    this.patientService.getDataPatient(encounterId).pipe(catchError(() => {
      return of({} as Patient);
    })).subscribe((patientData: Patient) => {
      this.patientDetails = patientData;
      this.maritalStatus = this.patientDetails.maritalStatus;
      this.storageService.setPatientData(patientData);
    });
  }


  public switchTabs(tab) {
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

  public openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
  }

  public openModalVital() {
    if (this.enableCreateVitals) return;
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

  public deleteFromAllergy(item, index) {
    this.toAllergyArr.splice(index, 1);
  }

  public openModalForDiagnosis() {
    // this.diagnosisNotesKardex.openModalForDiagnosisKardex();
  }

  public deleteDiagnosisFromTable(index, i) {
    this.toDiagnosisArr.splice(index, 1);
  }

  public handleCheckboxVitals() {
    this.enableCreateVitals = !this.enableCreateVitals;
  }

  public deleteVitalsFromTable(index, i) {
    this.toVitalsArr.splice(index, 1);
  }

  public openGlosgowComaModel(item: any) {
    if (this.noScaleAppicable) return;
    this.scalesEditConfirmationMsg(item);
  }

  private scalesEditConfirmationMsg(item: { value: string; }) {
    Swal.fire({
      text: 'Are you sure you want to edit scale',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
    }).then((res) => {
      if (res.isConfirmed) {
        if (item.value == '1') {
          this.scalesGlosgow.openModalForGlosgow('');
        } else if (item.value == '2') {
          this.scalesFacePain.openModalForFacePain('');
        } else if (item.value == '3') {
          this.scalesNumericRating.openModalForNumericRating('');
        }
      }
    });
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
    if (tab == 'social') {
      this.socialHistory = true;
      this.psychologicalHistory = false;
    } else {
      this.socialHistory = false;
      this.psychologicalHistory = true;
    }
  }

  public openModelForAddHabitSocial(index: any, item: any) {
    if (item.Status) {
      this.swallConfirmation(item.label, index);
    } else {
      this.socialAddHabit.openModalForAddHabit(item.label, this.selectedTableDetails, this.patientDetails, item);
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
            this.selectedTableDetails,
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
    this.emergencyService.getSocialHabitList(this.paramsObject.patnr).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        this.socialHabitList = data?.d?.results;
        let checkAlcoholData = data?.d?.results.find(res => res.Type == 'Alcohol');
        if (checkAlcoholData) {
          this.socialHistoryList[0].DateFrom = checkAlcoholData.DateFrom;
          this.socialHistoryList[0].Status = checkAlcoholData.Status;
          this.socialHistoryList[0].Quantity = checkAlcoholData.Quantity;
          this.socialHistoryList[0].Duration = checkAlcoholData.Duration;
          this.socialHistoryList[0].Habitid = checkAlcoholData.Habitid;
        }
        let checkDrugsData = data?.d?.results.find(res => res.Type.split('/')[0].trim() === 'Drug');
        if (checkDrugsData) {
          this.socialHistoryList[1].DateFrom = checkDrugsData.DateFrom;
          this.socialHistoryList[1].Status = checkDrugsData.Status;
          this.socialHistoryList[1].Quantity = checkDrugsData.Quantity;
          this.socialHistoryList[1].Duration = checkDrugsData.Duration;
          this.socialHistoryList[1].Habitid = checkDrugsData.Habitid;
        }
        let checkTobaccoData = data?.d?.results.find(res => res.Type.split('/')[0].trim() === 'Tobacco');
        if (checkTobaccoData) {
          this.socialHistoryList[2].DateFrom = checkTobaccoData.DateFrom;
          this.socialHistoryList[2].Status = checkTobaccoData.Status;
          this.socialHistoryList[2].Quantity = checkTobaccoData.Quantity;
          this.socialHistoryList[2].Duration = checkTobaccoData.Duration;
          this.socialHistoryList[2].Habitid = checkTobaccoData.Habitid;
        }
        let checkOtherData = data?.d?.results.find(res => res.Type.split('/')[0].trim() === 'Other');
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
      Habitid: ''
    };
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

  public saveHabitData(event) {
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

  public onCheckboxChange(event: any) {
    const isChecked = event.target.checked;
    // If 'No Psychological Applicable' checkbox is unchecked
    if (isChecked) {
      // Uncheck all other psychological history checkboxes
      this.psychologicalHistoryList.forEach(item => {
        this.triageForm.get(item.controlname)?.setValue(false);
      });
    }

  }

  public changeAssessment(tab: string) {
    if (tab == 'Functional') {
      this.functionalAssessmentTab = true;
      this.nutritionalAssessmentTab = false;
    } else {
      this.functionalAssessmentTab = false;
      this.nutritionalAssessmentTab = true;
    }
  }

  public changeSelfCaring(event, type: string) {
    if (type == AssessmentType.NoProblemIdentified$) {
      this.triageForm.patchValue({
        noProblemIdentifySelfCaring: true,
        needSuperVisionTotalDependent: false,
      });
    } else {
      this.triageForm.patchValue({
        noProblemIdentifySelfCaring: false,
        needSuperVisionTotalDependent: true,
      });
    }
  }

  public changeMusculoskeletal(event, type: string) {
    if (type == AssessmentType.NoProblemIdentified$) {
      this.triageForm.patchValue({
        noProblemIdentifyMuscu: true,
        problemIdenfifyMuscu: false,
      });
    } else {
      this.triageForm.patchValue({
        noProblemIdentifyMuscu: false,
        problemIdenfifyMuscu: true,
      });
    }
  }

  public changeEquipmentAssignment(event, type: string) {
    if (type == AssessmentType.NoEquipment$) {
      this.triageForm.patchValue({
        noEquipment: true,
        usedEquipments: false,
      });
    } else {
      this.triageForm.patchValue({
        noEquipment: false,
        usedEquipments: true,
      });
    }
  }
  public changeUseEquipment(event) {
    const selectControl = this.triageForm.get('usedEquipmentsOtherOpt');
    if (event == 5) {
      selectControl.enable();
      selectControl.patchValue('');
    } else {
      selectControl.patchValue('');
      selectControl.disable();
    }
  }

  public selectNutritionalRiskOptions(event: any, item: any) {
    const isChecked = event.target.checked;
    const riskValue = item;

    if (isChecked) {
      // Add the selected nutritional risk to the array
      this.nutritionalRiskesArray.push(riskValue);
    } else {
      // Remove the nutritional risk from the array
      const index = this.nutritionalRiskesArray.indexOf(riskValue);
      if (index !== -1) {
        this.nutritionalRiskesArray.splice(index, 1);
      }
    }
    this.totalScoreCalc(this.nutritionalRiskesArray);
  }

  private totalScoreCalc(value: any) {
    const sumOfValues = value.reduce((acc, obj) => {
      const numericValue = +obj.value;
      return acc + numericValue;
    }, 0);
    this.triageForm.get('nutritionalRiskScore').patchValue(sumOfValues);
    this.scoreLabel(sumOfValues);
  }

  private scoreLabel(value: number) {
    if (value == 0) {
      this.triageForm.get('nutritionalRiskValue').patchValue('No risk');
    } else if (value > 1 && value < 4) {
      this.triageForm.get('nutritionalRiskValue').patchValue('Low risk');
    } else if (value > 5 && value < 7) {
      this.triageForm.get('nutritionalRiskValue').patchValue('Moderate risk');
    } else if (value > 7) {
      this.triageForm.get('nutritionalRiskValue').patchValue('High risk');
    }

  }

  public changeReviewofSystem(tabName: any) {

    this.activeReviewSystemTab = tabName; // Set active tab label
    // Perform any other actions when a tab is clicked
  }

  public saveEmergencyNursingDocument() {
    return new Promise((resolve, reject) => {
      let checkScalesList: any[] = this.scalesList.filter((res) => {
        delete res.description;
        delete res.value;
        if (res.LastScore) return res;
      });

      let updatedList = this.socialHistoryList.map(item => {
        const { Status, value, label, Quantity, DateFrom, Habitid, ...rest } = item;
        if (item.Status) {
          return { ...rest, Description: Status, ConsumptionQty: Quantity, Dockey: '', Year: null };
        }
      });
      updatedList = updatedList.filter(item => item !== undefined);

      let payload = {
        ...this.triageForm.value,
        TOALLERGIES: this.toAllergyArr,
        TOVITALSIGNS: this.toVitalsArr,
        TOSCALE: checkScalesList,
        TOSOCIAL: updatedList
      };

      if (payload.ArrivalTime != '') {
        let createtime = payload.ArrivalTime.split(':');
        payload.ArrivalTime =
          'PT' + createtime[0] + 'H' + createtime[1] + 'M' + '00S';
      }
      console.log(payload);
      // return;
      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService.saveNurEmrTriage(payload).subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          this.updateTriageStatus();
          this.sharedService.successSwallModel('Triage history saved successfully');
          // this.modalRefForAllergy?.hide();
        },
        error: (error: any) => {
          // Handle errors if the request fails
          this.sharedService.waringSwallModel(`POST Error : ${error?.error?.error?.message?.value}`);
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          resolve(true); // Resolve the promise with formValue
        }
      });
    });
  }

  public updateTriageStatus(): void {
    let payload = {
      Dockey: this.triageForm.value.Dockey,
      Dokst: "FR",
      Dokvr: this.Zversion,
      Dtid: "ZMED_TRPRI",
      DtidText: "",
      Einri: this.paramsObject.einri,
      Etag: "",
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Mitarb: "",
      Mitarbname: "",
      Orgdo: "",
      Orgfa: "",
      Orgpf: "",
      Patnr: this.paramsObject.patnr,
      Referredby: "",
      Released: false,
      TriageColor: this.triagePriorities.filter((item) => item.value == this.triageForm.value.TriagePriority)[0].backgroundColor,
      TriagePriorityCode: this.triagePriorities.filter((item) => item.value == this.triageForm.value.TriagePriority)[0].value,
      TriagePriorityText: this.triagePriorities.filter((item) => item.value == this.triageForm.value.TriagePriority)[0].label,
      Zimmr: "",
      Mode: true,
    }
    console.log(payload);
    this.subscription = this.emergencyService.saveTriage(payload).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
      },
      error: (error: any) => {
        // Handle errors if the request fails
        this.sharedService.waringSwallModel(`POST Error : ${error?.error?.error?.message?.value}`);
      },
    });
  }
}
