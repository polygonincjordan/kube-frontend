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
  public AssessmentType: any;

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
    { value: '01', label: 'Feeding', controlname: 'FunSelfNeedsFeeding' },
    { value: '02', label: 'Hygiene', controlname: 'FunSelfNeedsHygiene' },
    { value: '03', label: 'Toileting', controlname: 'FunSelfNeedsToileting' },
    { value: '04', label: 'Amulation', controlname: 'FunSelfNeedsAmulation' },
  ];

  public problemIdentifiedList: commonKeyValuePair[] = [
    { value: '0', label: 'Deformities' },
    { value: '1', label: 'Contractures' },
    { value: '2', label: 'Amputeee' },
    { value: '3', label: 'Bedridden' },
    { value: '4', label: 'Musculoskeletal pain' },
  ];

  public usedEquipmentsList: commonKeyValuePair[] = [
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

  public nutritionalRiskList: commonKeyValuePariExt4[] = [
    { id: '1', value: '3', label: '(3) Pregnancy', controlname: 'NutPregnancy' },
    { id: '6', value: '3', label: '(3) Underweight', controlname: 'NutUnderweight' },
    { id: '11', value: '3', label: '(3) Malnutrition', controlname: 'NutMalnutrition' },
    { id: '15', value: '3', label: '(3) Renal disease hepatitis', controlname: 'NutHepatitis' },

    { id: '2', value: '2', label: '(2) HTN', controlname: 'NutHtn' },
    { id: '7', value: '2', label: '(2) COPD', controlname: 'NutCopd' },
    { id: '12', value: '2', label: '(2) CHF', controlname: 'NutChf' },
    { id: '16', value: '2', label: '(2) CAD', controlname: 'NutCad' },

    { id: '3', value: '2', label: '(2) Eating disorder', controlname: 'NutEatingDisorder' },
    { id: '8', value: '1', label: '(1) Food allergies', controlname: 'NutFoodAllergies' },
    { id: '13', value: '1', label: '(1) Chewing Problem', controlname: 'NutChewingProblems' },
    { id: '17', value: '1', label: '(1) Chronic Constipation', controlname: 'NutChronicConstipation' },

    { id: '4', value: '1', label: '(1) Vomitting > 48 h ', controlname: 'NutVomitting' },
    { id: '9', value: '1', label: '(1) Diarrhea < 48 h ', controlname: 'NutDiarrhea' },
    { id: '14', value: '3', label: '(3) Diabetes', controlname: 'NutDiabetes' },
    { id: '17', value: '3', label: '(3) HIV / AIDS', controlname: 'NutHiv' },

    { id: '5', value: '2', label: '(2) G I disorder', controlname: 'NutGiDisorder' },
    { id: '10', value: '1', label: '(1) Low albumin', controlname: 'NutLowAlbumin' },
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
  public selectedTriageDetails: any;
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
  // private documentStatus: string = "";

  constructor(
    public storageService: StorageService,
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private _route: ActivatedRoute,
    private emergencyService: EmergencyService,
    private sharedService: SharedService,
    private dataShareService: DataShareService,
  ) {
    this.AssessmentType = AssessmentType;
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
        this.initForm();
        if (data.type == ActionType.Add$ && data.isAllow == true && data.value == '') {
          this.documentMode = ActionType.Add$;
          let checkindata: any = JSON.parse(localStorage.getItem('checkindata'));
          this.selectedTableDetails = checkindata;
          this.documentStatus = '1';
          setTimeout(() => {
            this.patchValuetoFormDate();
          }, 1500);
        } else if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
          this.documentMode = ActionType.Update$;
          if (data.value.type == WordType.EditEND && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.selectedTableDetails = data.value.latest;
              this.Zversion = data.value.latest.Zversion;
              this.ZMode = 'U';
              this.documentStatus = '1';
              this.statusDraftDocDetails(this.dockeyValue);
              this.getTiragePriorityList();
              this.getSocialHistoryHabitList();
            }
          }
        } else if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
          this.documentMode = ActionType.Copy$;
          if (data.value.type == WordType.CopyEND && data.value.docKey != '') {
            this.dockeyValue = data.value.docKey ? data.value.docKey : null;
            if (this.dockeyValue) {
              this.Zversion = data.value.latest.Zversion;
              this.ZMode = 'I';
              this.documentStatus = '5';
              this.statusDraftDocDetails(this.dockeyValue);
              this.getTiragePriorityList();
              this.getSocialHistoryHabitList();
            }
          }

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
    // this.formControlHandeler();
  }

  private formControlHandeler() {
    this.triageForm.get('FunSelfNoProblem').valueChanges.subscribe((value) => {
      const selectControl1 = this.triageForm.get('FunSelfNeedsFeeding');
      const selectControl2 = this.triageForm.get('FunSelfNeedsHygiene');
      const selectControl3 = this.triageForm.get('FunSelfNeedsToileting');
      const selectControl4 = this.triageForm.get('FunSelfNeedsAmulation');
      if (value) {
        selectControl1.patchValue(false);
        selectControl2.patchValue(false);
        selectControl3.patchValue(false);
        selectControl4.patchValue(false);
      }
    });

    this.triageForm.get('FunMusNoProblem').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('FunMusProblems');
      if (value) {
        selectControl.patchValue('');
      }
    });

    this.triageForm.get('FunAssEquipmentNone').valueChanges.subscribe((value) => {
      const selectControl1 = this.triageForm.get('FunAssEquipmentUseOfTyp');
      const selectControl2 = this.triageForm.get('FunAssEquipmentUseOfTxt');
      if (value) {
        selectControl1.patchValue('');
        selectControl2.patchValue('');
      }
    });

    this.triageForm.get('FunSelfNeedsSuper').valueChanges.subscribe((value) => {
      const selectControl1 = this.triageForm.get('FunSelfNeedsFeeding');
      const selectControl2 = this.triageForm.get('FunSelfNeedsHygiene');
      const selectControl3 = this.triageForm.get('FunSelfNeedsToileting');
      const selectControl4 = this.triageForm.get('FunSelfNeedsAmulation');
      if (value) {
        selectControl1.enable();
        selectControl2.enable();
        selectControl3.enable();
        selectControl4.enable();
      } else {
        selectControl1.disable();
        selectControl2.disable();
        selectControl3.disable();
        selectControl4.disable();
      }
    });

    this.triageForm.get('FunMusProblemIdentified').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('FunMusProblems');
      if (value) {
        selectControl.enable();
      } else {
        selectControl.disable();
      }
    });

    this.triageForm.get('FunAssEquipmentUseOf').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('FunAssEquipmentUseOfTyp');
      if (value) {
        selectControl.enable();
      } else {
        selectControl.disable();
      }
    });

    this.triageForm.get('NutAppetite').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('NutAppetiteTxt');
      if (value == 4) {
        selectControl.enable();
        selectControl.patchValue('');
      } else {
        selectControl.disable();
        selectControl.patchValue('');
      }
    });

    this.triageForm.get('NutAppearance').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('NutAppearanceTxt');
      if (value == 4) {
        selectControl.enable();
        selectControl.patchValue('');
      } else {
        selectControl.disable();
        selectControl.patchValue('');
      }
    });

    this.triageForm.get('NutSupport').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('NutAppearanceTxt');
      if (value == 4) {
        selectControl.enable();
        selectControl.patchValue('');
      } else {
        selectControl.disable();
        selectControl.patchValue('');
      }
    });

    this.triageForm.get('NutDiet').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('NutDietTxt');
      if (value == 3) {
        selectControl.enable();
        selectControl.patchValue('');
      } else {
        selectControl.disable();
        selectControl.patchValue('');
      }
    });

    this.triageForm.get('NutFeeding').valueChanges.subscribe((value) => {
      const selectControl = this.triageForm.get('NutFeedingTxt');
      if (value == 5) {
        selectControl.enable();
        selectControl.patchValue('');
      } else {
        selectControl.disable();
        selectControl.patchValue('');
      }
    });

    this.triageForm.get('CannotAssessedReview').valueChanges.subscribe((value) => {
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


  public handleControlChanges(controlName: string, issueList: any[], relatedControlName?: string[]): void {
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
      Dockey: new FormControl(),
      Dtid: new FormControl(),
      Einri: new FormControl(),
      Patnr: new FormControl(),
      Falnr: new FormControl(),
      Lfdnr: new FormControl(),
      Orgdo: new FormControl(),
      ArrivalMode: new FormControl(),
      ArrivalModeTxt: new FormControl(),
      Accompanied: new FormControl(),
      AccompaniedTxt: new FormControl(),
      Language: new FormControl(),
      TriagePriority: new FormControl(),
      ArrivalTime: new FormControl(),
      ChiefComplaint: [''],
      PsyNoProblem: [false],
      PsyAnxious: [false],
      PsyUncooperative: [false],
      PsyDepressed: [false],
      PsyAngry: new FormControl(),
      PsyAgitated: new FormControl(),
      PsyCombative: new FormControl(),
      PsyOther: new FormControl(),
      PsyComments: new FormControl(),
      AttendPhy: [this.storageService.getGpart()],

      FunSelfNoProblem: new FormControl(),
      FunSelfNeedsSuper: new FormControl(),
      FunSelfNeedsFeeding: new FormControl(),
      FunSelfNeedsHygiene: new FormControl(),
      FunSelfNeedsToileting: new FormControl(),
      FunSelfNeedsAmulation: new FormControl(),


      FunMusNoProblem: new FormControl(),
      FunMusProblemIdentified: new FormControl(),
      FunMusProblems: new FormControl(),

      FunAssEquipmentNone: new FormControl(),
      FunAssEquipmentUseOf: new FormControl(),
      FunAssEquipmentUseOfTyp: new FormControl(),
      FunAssEquipmentUseOfTxt: new FormControl(),

      FunDrNotification: new FormControl(),
      FunNotified: new FormControl(),

      NutDiabetes: new FormControl(),
      NutPregnancy: new FormControl(),
      NutHepatitis: new FormControl(),
      NutMalnutrition: new FormControl(),
      NutUnderweight: new FormControl(),
      NutHiv: new FormControl(),
      NutHtn: new FormControl(),
      NutCopd: new FormControl(),
      NutChf: new FormControl(),
      NutCad: new FormControl(),
      NutGiDisorder: new FormControl(),
      NutEatingDisorder: new FormControl(),
      NutFoodAllergies: new FormControl(),
      NutChewingProblems: new FormControl(),
      NutChronicConstipation: new FormControl(),
      NutLowAlbumin: new FormControl(),
      NutVomitting: new FormControl(),
      NutDiarrhea: new FormControl(),
      NutRiskScore: new FormControl(),
      NutRiskLevel: new FormControl(),
      NutAppetite: new FormControl(),
      NutAppetiteTxt: new FormControl(),
      NutAppearance: new FormControl(),
      NutAppearanceTxt: new FormControl(),
      NutLast1Month: new FormControl(),
      NutSupport: new FormControl(),
      NutSupportTxt: new FormControl(),
      NutLast3Month: new FormControl(),
      NutDiet: new FormControl(),
      NutDietTxt: new FormControl(),
      NutBmi: new FormControl(),
      NutFeeding: new FormControl(),
      NutFeedingTxt: new FormControl(),
      NutDrNotification: new FormControl(),
      NutNotified: new FormControl(),
      NutComments: new FormControl(),

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

  private patchValuetoFormDate(triageValue?: any) {
    if (this.documentMode == ActionType.Add$) {
      this.triageForm = this.formBuilder.group({
        Dockey: [''],
        Dtid: ['ZMED_TRASM'],
        Einri: [this.paramsObject.einri],
        Patnr: [this.paramsObject.patnr],
        Falnr: [this.paramsObject.falnr],
        Lfdnr: [this.paramsObject.lfdnr],
        Orgdo: ['EMEMDAMC'],
        ArrivalMode: [''],
        ArrivalModeTxt: [''],
        Accompanied: [''],
        AccompaniedTxt: [''],
        Language: ['English'],
        TriagePriority: [''],
        ArrivalTime: [this.parseTime(this.selectedTableDetails?.ZeitIntern)],
        ChiefComplaint: [''],
        PsyNoProblem: [false],
        PsyAnxious: [false],
        PsyUncooperative: [false],
        PsyDepressed: [false],
        PsyAngry: [false],
        PsyAgitated: [false],
        PsyCombative: [false],
        PsyOther: [false],
        PsyComments: [''],
        AttendPhy: [this.storageService.getGpart()],

        FunSelfNoProblem: [{ value: false, disabled: false }],
        FunSelfNeedsSuper: [{ value: false, disabled: false }],
        needSuperVisionTotalDependentOption: [{ value: '', disabled: true }],
        FunSelfNeedsFeeding: [{ value: false, disabled: true }],
        FunSelfNeedsHygiene: [{ value: false, disabled: true }],
        FunSelfNeedsToileting: [{ value: false, disabled: true }],
        FunSelfNeedsAmulation: [{ value: false, disabled: true }],

        FunMusNoProblem: [{ value: false, disabled: false }],
        FunMusProblemIdentified: [{ value: false, disabled: false }],
        FunMusProblems: [{ value: '', disabled: true }],

        FunAssEquipmentNone: [{ value: false, disabled: false }],
        FunAssEquipmentUseOf: [{ value: false, disabled: false }],
        FunAssEquipmentUseOfTyp: [{ value: '', disabled: true }],
        FunAssEquipmentUseOfTxt: [{ value: '', disabled: true }],

        FunDrNotification: [{ value: '', disabled: false }],
        FunNotified: [{ value: '', disabled: false }],

        NutDiabetes: [{ value: false, disabled: false }],
        NutPregnancy: [{ value: false, disabled: false }],
        NutHepatitis: [{ value: false, disabled: false }],
        NutMalnutrition: [{ value: false, disabled: false }],
        NutUnderweight: [{ value: false, disabled: false }],
        NutHiv: [{ value: false, disabled: false }],
        NutHtn: [{ value: false, disabled: false }],
        NutCopd: [{ value: false, disabled: false }],
        NutChf: [{ value: false, disabled: false }],
        NutCad: [{ value: false, disabled: false }],
        NutGiDisorder: [{ value: false, disabled: false }],
        NutEatingDisorder: [{ value: false, disabled: false }],
        NutFoodAllergies: [{ value: false, disabled: false }],
        NutChewingProblems: [{ value: false, disabled: false }],
        NutChronicConstipation: [{ value: false, disabled: false }],
        NutLowAlbumin: [{ value: false, disabled: false }],
        NutVomitting: [{ value: false, disabled: false }],
        NutDiarrhea: [{ value: false, disabled: false }],

        NutRiskScore: [{ value: '0', disabled: true }],
        NutRiskLevel: [{ value: 'No Risk', disabled: true }],

        NutAppetite: [{ value: '', disabled: false }],
        NutAppetiteTxt: [{ value: '', disabled: true }],
        NutAppearance: [{ value: '', disabled: false }],
        NutAppearanceTxt: [{ value: '', disabled: true }],
        NutSupport: [{ value: '', disabled: false }],
        NutSupportTxt: [{ value: '', disabled: true }],
        NutDiet: [{ value: '', disabled: false }],
        NutDietTxt: [{ value: '', disabled: true }],
        NutFeeding: [{ value: '', disabled: false }],
        NutFeedingTxt: [{ value: '', disabled: true }],

        NutLast1Month: [{ value: '0.00', disabled: false }],
        NutLast3Month: [{ value: '0.00', disabled: false }],
        NutBmi: [{ value: '0.00', disabled: false }],

        NutDrNotification: [{ value: '', disabled: false }],
        NutNotified: [{ value: '', disabled: false }],
        NutComments: [{ value: '', disabled: false }],


        CannotAssessedReview: [{ value: false, disabled: false }],
        SNoReportedAbnorm: [{ value: false, disabled: false }],
        SRashes: [{ value: false, disabled: false }],
        SItching: [{ value: false, disabled: false }],
        SChangeHairNails: [{ value: false, disabled: false }],
        STypeRash: [{ value: '', disabled: false }],
        SComments: [{ value: '', disabled: false }],

        HNoReportedAbnorm: [{ value: false, disabled: false }],
        HHeadInjury: [{ value: false, disabled: false }],
        HHeadCircumference: [{ value: '0.00', disabled: false }],
        HComments: [{ value: '', disabled: false }],

        ENoReportedAbnorm: [{ value: false, disabled: false }],
        EGlassesContacts: [{ value: false, disabled: false }],
        EChangeVision: [{ value: false, disabled: false }],
        EEyePain: [{ value: false, disabled: false }],
        EDoubleVision: [{ value: false, disabled: false }],
        EFlashingLights: [{ value: false, disabled: false }],
        EGlaucomaCataracts: [{ value: false, disabled: false }],
        ELastEyeExam: [{ value: false, disabled: false }],
        EComments: [{ value: '', disabled: false }],

        EneNoReportedAbnorma: [{ value: false, disabled: false }],
        EneChangeHearing: [{ value: false, disabled: false }],
        EneTympanicMembrane: [{ value: false, disabled: false }],
        EneEarDischarge: [{ value: false, disabled: false }],
        EneRinging: [{ value: false, disabled: false }],
        EneDizziness: [{ value: false, disabled: false }],

        EnnNoReportedAbnorm: [{ value: false, disabled: false }],
        EnnNoseBleeds: [{ value: false, disabled: false }],
        EnnNasalStuffiness: [{ value: false, disabled: false }],
        EnnNasalFlaring: [{ value: false, disabled: false }],
        EnnFrequentColds: [{ value: false, disabled: false }],

        EnmNoReportedAbnorm: [{ value: false, disabled: false }],
        EnmBleedingGums: [{ value: false, disabled: false }],
        EnmSoreTongue: [{ value: false, disabled: false }],
        EnmLipColor: [{ value: '', disabled: false }],
        EnmComments: [{ value: '', disabled: false }],

        NNoReportedAbnorm: [{ value: false, disabled: false }],
        NLumps: [{ value: false, disabled: false }],
        NSwollenGlands: [{ value: false, disabled: false }],
        NGoiter: [{ value: false, disabled: false }],
        NStiffness: [{ value: false, disabled: false }],
        NComments: [{ value: '', disabled: false }],

        BNoReportedAbnorm: [{ value: false, disabled: false }],
        BLumps: [{ value: false, disabled: false }],
        BPain: [{ value: false, disabled: false }],
        BNippleDischarge: [{ value: false, disabled: false }],
        BSkinAbnormalities: [{ value: false, disabled: false }],
        BComments: [{ value: '', disabled: false }],

        RNoReportedAbnorm: [{ value: false, disabled: false }],
        RShortnessBreath: [{ value: false, disabled: false }],
        RCough: [{ value: false, disabled: false }],
        RWheezing: [{ value: false, disabled: false }],
        RCoughingBlood: [{ value: false, disabled: false }],
        RProductionPhlegm: [{ value: false, disabled: false }],
        RChestPain: [{ value: false, disabled: false }],
        RFever: [{ value: false, disabled: false }],
        RNightSweats: [{ value: false, disabled: false }],
        RBlueFingersToes: [{ value: false, disabled: false }],
        RSwellingHandsFeet: [{ value: false, disabled: false }],
        RBronchitisEmphysema: [{ value: false, disabled: false }],
        RHxHeartMedication: [{ value: false, disabled: false }],
        RSkippingHeartBeats: [{ value: false, disabled: false }],
        RHeartMurmur: [{ value: false, disabled: false }],
        RComments: [{ value: '', disabled: false }],

        GNoReportedAbnorm: [{ value: false, disabled: false }],
        GChangeAppetiteWeight: [{ value: false, disabled: false }],
        GProblemsSwallowing: [{ value: false, disabled: false }],
        GNausea: [{ value: false, disabled: false }],
        GHeartburn: [{ value: false, disabled: false }],
        GVomiting: [{ value: false, disabled: false }],
        GVomitingBlood: [{ value: false, disabled: false }],
        GConstipation: [{ value: false, disabled: false }],
        GDiarrhea: [{ value: false, disabled: false }],
        GChangeBowelHabits: [{ value: false, disabled: false }],
        GAbdominalPain: [{ value: false, disabled: false }],
        GExcessiveBelching: [{ value: false, disabled: false }],
        GExcessiveFlatus: [{ value: false, disabled: false }],
        GFoodIntolerance: [{ value: false, disabled: false }],
        GRectalBleedingHemo: [{ value: false, disabled: false }],
        GYellowColourSkin: [{ value: false, disabled: false }],
        GToiletTrained: [{ value: false, disabled: false }],
        GTfreq: [{ value: '', disabled: false }],
        GUsesDiaper: [{ value: false, disabled: false }],
        GUfreq: [{ value: '', disabled: false }],
        GComments: [{ value: '', disabled: false }],

        UNoReportedAbnorm: [{ value: false, disabled: false }],
        UDifficultyUrination: [{ value: false, disabled: false }],
        UPainBurningUrination: [{ value: false, disabled: false }],
        UFrequentUrinationNight: [{ value: false, disabled: false }],
        UUrgentNeedUrinate: [{ value: false, disabled: false }],
        UIncontinenceUrine: [{ value: false, disabled: false }],
        UDribbling: [{ value: false, disabled: false }],
        UDecreasedUrineStream: [{ value: false, disabled: false }],
        UBloodUrine: [{ value: false, disabled: false }],
        UUtiStonesProstate: [{ value: false, disabled: false }],
        UComments: [{ value: '', disabled: false }],

        PNoReportedAbnorm: [{ value: false, disabled: false }],
        PLegCramps: [{ value: false, disabled: false }],
        PVaricoseVeins: [{ value: false, disabled: false }],
        PClotsVeins: [{ value: false, disabled: false }],
        PComments: [{ value: '', disabled: false }],

        MNoReportedAbnorm: [{ value: false, disabled: false }],
        MPain: [{ value: false, disabled: false }],
        MSwelling: [{ value: false, disabled: false }],
        MStiffness: [{ value: false, disabled: false }],
        MDecreasedJointMotion: [{ value: false, disabled: false }],
        MBrokenBone: [{ value: false, disabled: false }],
        MSeriousSprains: [{ value: false, disabled: false }],
        MArthritis: [{ value: false, disabled: false }],
        MGout: [{ value: false, disabled: false }],
        MComments: [{ value: '', disabled: false }],

        NuNoReportedAbnorm: [{ value: false, disabled: false }],
        NuHeadaches: [{ value: false, disabled: false }],
        NuSeizures: [{ value: false, disabled: false }],
        NuParalysis: [{ value: false, disabled: false }],
        NuWeakness: [{ value: false, disabled: false }],
        NuLossConsciousness: [{ value: false, disabled: false }],
        NuLossMuscleSize: [{ value: false, disabled: false }],
        NuMuscleSpasm: [{ value: false, disabled: false }],
        NuTremor: [{ value: false, disabled: false }],
        NuInvoluntaryMovement: [{ value: false, disabled: false }],
        NuNumbness: [{ value: false, disabled: false }],
        NuIncoordination: [{ value: false, disabled: false }],
        NuFeelingPinsNeedles: [{ value: false, disabled: false }],
        NuComments: [{ value: '', disabled: false }],

        HeNoReportedAbnorm: [{ value: false, disabled: false }],
        HeAnemia: [{ value: false, disabled: false }],
        HeEasyBruisingBleeding: [{ value: false, disabled: false }],
        HeComments: [{ value: '', disabled: false }],


        EdNoReportedAbnorm: [{ value: false, disabled: false }],
        EdAbnormalGrowth: [{ value: false, disabled: false }],
        EdIncreasedAppetite: [{ value: false, disabled: false }],
        EdIncreasedThirst: [{ value: false, disabled: false }],
        EdIncreaseUrineProduction: [{ value: false, disabled: false }],
        EdThyroidTrouble: [{ value: false, disabled: false }],
        EdHeatColdIntolerance: [{ value: false, disabled: false }],
        EdExcessingSweating: [{ value: false, disabled: false }],
        EdDiabetes: [{ value: false, disabled: false }],
        EdComments: [{ value: '', disabled: false }],

        PsNoReportedAbnorm: [{ value: false, disabled: false }],
        PsTensionAnxiety: [{ value: false, disabled: false }],
        PsDepressionSuicide: [{ value: false, disabled: false }],
        PsMemoryProblems: [{ value: false, disabled: false }],
        PsPastTreatmentPsychiatri: [{ value: false, disabled: false }],
        PsSleepProblems: [{ value: false, disabled: false }],
        PsUnusualProblems: [{ value: false, disabled: false }],
        PsChangeMood: [{ value: false, disabled: false }],
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
        TriagePriority: this.selectedTriageDetails?.TriagePriorityCode || (triageValue?.TriagePriority ?? ''),
        // TriagePriority: triageValue?.TriagePriority ? triageValue?.TriagePriority : this.selectedTableDetails.TriagePriorityCode,
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

        FunSelfNoProblem: triageValue?.FunSelfNoProblem ? triageValue?.FunSelfNoProblem : false,
        FunSelfNeedsSuper: triageValue?.FunSelfNeedsSuper ? triageValue?.FunSelfNeedsSuper : false,
        FunSelfNeedsFeeding: triageValue?.FunSelfNeedsFeeding ? triageValue?.FunSelfNeedsFeeding : false,
        FunSelfNeedsHygiene: triageValue?.FunSelfNeedsHygiene ? triageValue?.FunSelfNeedsHygiene : false,
        FunSelfNeedsToileting: triageValue?.FunSelfNeedsToileting ? triageValue?.FunSelfNeedsToileting : false,
        FunSelfNeedsAmulation: triageValue?.FunSelfNeedsAmulation ? triageValue?.FunSelfNeedsAmulation : false,

        FunMusNoProblem: triageValue?.FunMusNoProblem ? triageValue?.FunMusNoProblem : false,
        FunMusProblemIdentified: triageValue?.FunMusProblemIdentified ? triageValue?.FunMusProblemIdentified : false,
        FunMusProblems: triageValue?.FunMusProblems ? triageValue?.FunMusProblems : '',

        FunAssEquipmentNone: triageValue?.FunAssEquipmentNone ? triageValue?.FunAssEquipmentNone : false,
        FunAssEquipmentUseOf: triageValue?.FunAssEquipmentUseOf ? triageValue?.FunAssEquipmentUseOf : false,
        FunAssEquipmentUseOfTyp: [{ value: triageValue?.FunAssEquipmentUseOfTyp ? triageValue?.FunAssEquipmentUseOfTyp : '', disabled: false }],
        FunAssEquipmentUseOfTxt: [{ value: triageValue?.FunAssEquipmentUseOfTxt ? triageValue?.FunAssEquipmentUseOfTxt : '', disabled: triageValue?.FunAssEquipmentUseOfTyp == 5 ? false : true }],

        FunDrNotification: triageValue?.FunDrNotification ? triageValue?.FunDrNotification : '',
        FunNotified: triageValue?.FunNotified ? triageValue?.FunNotified : '',


        NutDiabetes: triageValue?.NutDiabetes ? triageValue?.NutDiabetes : false,
        NutPregnancy: triageValue?.NutPregnancy ? triageValue?.NutPregnancy : false,
        NutHepatitis: triageValue?.NutHepatitis ? triageValue?.NutHepatitis : false,
        NutMalnutrition: triageValue?.NutMalnutrition ? triageValue?.NutMalnutrition : false,
        NutUnderweight: triageValue?.NutUnderweight ? triageValue?.NutUnderweight : false,
        NutHiv: triageValue?.NutHiv ? triageValue?.NutHiv : false,
        NutHtn: triageValue?.NutHtn ? triageValue?.NutHtn : false,
        NutCopd: triageValue?.NutCopd ? triageValue?.NutCopd : false,
        NutChf: triageValue?.NutChf ? triageValue?.NutChf : false,
        NutCad: triageValue?.NutCad ? triageValue?.NutCad : false,
        NutGiDisorder: triageValue?.NutGiDisorder ? triageValue?.NutGiDisorder : false,
        NutEatingDisorder: triageValue?.NutEatingDisorder ? triageValue?.NutEatingDisorder : false,
        NutFoodAllergies: triageValue?.NutFoodAllergies ? triageValue?.NutFoodAllergies : false,
        NutChewingProblems: triageValue?.NutChewingProblems ? triageValue?.NutChewingProblems : false,
        NutChronicConstipation: triageValue?.NutChronicConstipation ? triageValue?.NutChronicConstipation : false,
        NutLowAlbumin: triageValue?.NutLowAlbumin ? triageValue?.NutLowAlbumin : false,
        NutVomitting: triageValue?.NutVomitting ? triageValue?.NutVomitting : false,
        NutDiarrhea: triageValue?.NutDiarrhea ? triageValue?.NutDiarrhea : false,

        NutRiskScore: [{ value: triageValue?.NutRiskScore ? triageValue?.NutRiskScore : '0', disabled: true }],
        NutRiskLevel: [{ value: triageValue?.NutRiskLevel ? triageValue?.NutRiskLevel : 'No Risk', disabled: true }],

        NutAppetite: [{ value: triageValue?.NutAppetite ? triageValue?.NutAppetite : '', disabled: false }],
        NutAppetiteTxt: [{ value: triageValue?.NutAppetiteTxt ? triageValue?.NutAppetiteTxt : '', disabled: triageValue?.NutAppetite == 4 ? false : true }],
        NutAppearance: [{ value: triageValue?.NutAppearance ? triageValue?.NutAppearance : '', disabled: false }],
        NutAppearanceTxt: [{ value: triageValue?.NutAppearanceTxt ? triageValue?.NutAppearanceTxt : '', disabled: triageValue?.NutAppearance == 4 ? false : true }],
        NutSupport: [{ value: triageValue?.NutSupport ? triageValue?.NutSupport : '', disabled: false }],
        NutSupportTxt: [{ value: triageValue?.NutSupportTxt ? triageValue?.NutSupportTxt : '', disabled: triageValue?.NutSupport == 4 ? false : true }],
        NutDiet: [{ value: triageValue?.NutDiet ? triageValue?.NutDiet : '', disabled: false }],
        NutDietTxt: [{ value: triageValue?.NutDietTxt ? triageValue?.NutDietTxt : '', disabled: triageValue?.NutDiet == 3 ? false : true }],
        NutFeeding: [{ value: triageValue?.NutFeeding ? triageValue?.NutFeeding : '', disabled: false }],
        NutFeedingTxt: [{ value: triageValue?.NutFeedingTxt ? triageValue?.NutFeedingTxt : '', disabled: triageValue?.NutDiet == 5 ? false : true }],

        NutLast1Month: triageValue?.NutLast1Month ? triageValue?.NutLast1Month : '0.00',
        NutLast3Month: triageValue?.NutLast3Month ? triageValue?.NutLast3Month : '0.00',
        NutBmi: triageValue?.NutBmi ? triageValue?.NutBmi : '0.00',

        NutDrNotification: triageValue?.NutDrNotification ? triageValue?.NutDrNotification : '',
        NutNotified: triageValue?.NutNotified ? triageValue?.NutNotified : '',
        NutComments: triageValue?.NutComments ? triageValue?.NutComments : '',

        CannotAssessedReview: triageValue?.CannotAssessedReview ? triageValue?.CannotAssessedReview : false,

        SNoReportedAbnorm: [{ value: triageValue?.SNoReportedAbnorm == true ? true : false, disabled: false }],
        SRashes: [{ value: triageValue?.SNoReportedAbnorm == true ? false : triageValue?.SRashes, disabled: triageValue?.SNoReportedAbnorm == false ? false : true }],
        SItching: [{ value: triageValue?.SNoReportedAbnorm == true ? false : triageValue?.SItching, disabled: triageValue?.SNoReportedAbnorm == false ? false : true }],
        SChangeHairNails: [{ value: triageValue?.SNoReportedAbnorm == true ? false : triageValue?.SChangeHairNails, disabled: triageValue?.SNoReportedAbnorm == false ? false : true }],
        STypeRash: [{ value: triageValue?.SNoReportedAbnorm == true ? '' : triageValue?.STypeRash, disabled: triageValue?.SNoReportedAbnorm == false ? false : true }],
        SComments: triageValue?.SComments ? triageValue?.SComments : '',

        HNoReportedAbnorm: [{ value: triageValue?.HNoReportedAbnorm == true ? true : false, disabled: false }],
        HHeadInjury: [{ value: triageValue?.HNoReportedAbnorm == true ? false : triageValue?.HHeadInjury, disabled: triageValue?.HNoReportedAbnorm == false ? false : true }],
        HHeadCircumference: [{ value: triageValue?.HNoReportedAbnorm == true ? '' : triageValue?.HHeadCircumference, disabled: triageValue?.HNoReportedAbnorm == false ? false : true }],
        HComments: triageValue?.HComments ? triageValue?.HComments : '',

        ENoReportedAbnorm: [{ value: triageValue?.ENoReportedAbnorm == true ? true : false, disabled: false }],
        EGlassesContacts: [{ value: triageValue?.ENoReportedAbnorm == true ? false : triageValue?.EGlassesContacts, disabled: triageValue?.ENoReportedAbnorm == false ? false : true }],
        EChangeVision: [{ value: triageValue?.ENoReportedAbnorm == true ? false : triageValue?.EChangeVision, disabled: triageValue?.ENoReportedAbnorm == false ? false : true }],
        EEyePain: [{ value: triageValue?.ENoReportedAbnorm == true ? false : triageValue?.EEyePain, disabled: triageValue?.ENoReportedAbnorm == false ? false : true }],
        EDoubleVision: [{ value: triageValue?.ENoReportedAbnorm == true ? false : triageValue?.EDoubleVision, disabled: triageValue?.ENoReportedAbnorm == false ? false : true }],
        EFlashingLights: [{ value: triageValue?.ENoReportedAbnorm == true ? false : triageValue?.EFlashingLights, disabled: triageValue?.ENoReportedAbnorm == false ? false : true }],
        EGlaucomaCataracts: [{ value: triageValue?.ENoReportedAbnorm == true ? false : triageValue?.EGlaucomaCataracts, disabled: triageValue?.ENoReportedAbnorm == false ? false : true }],
        ELastEyeExam: [{ value: triageValue?.ENoReportedAbnorm == true ? false : triageValue?.ELastEyeExam, disabled: triageValue?.ENoReportedAbnorm == false ? false : true }],
        EComments: triageValue?.EComments ? triageValue?.EComments : '',

        EneNoReportedAbnorma: [{ value: triageValue?.EneNoReportedAbnorma == true ? true : false, disabled: false }],
        EneChangeHearing: [{ value: triageValue?.EneNoReportedAbnorma == true ? false : triageValue?.EneNoReportedAbnorma, disabled: triageValue?.EneNoReportedAbnorma == false ? false : true }],
        EneTympanicMembrane: [{ value: triageValue?.EneNoReportedAbnorma == true ? false : triageValue?.EneChangeHearing, disabled: triageValue?.EneNoReportedAbnorma == false ? false : true }],
        EneEarDischarge: [{ value: triageValue?.EneNoReportedAbnorma == true ? false : triageValue?.EneEarDischarge, disabled: triageValue?.EneNoReportedAbnorma == false ? false : true }],
        EneRinging: [{ value: triageValue?.EneNoReportedAbnorma == true ? false : triageValue?.EneRinging, disabled: triageValue?.EneNoReportedAbnorma == false ? false : true }],
        EneDizziness: triageValue?.EneDizziness ? triageValue?.EneDizziness : false,

        EnnNoReportedAbnorm: [{ value: triageValue?.EnnNoReportedAbnorm == true ? true : false, disabled: false }],
        EnnNoseBleeds: [{ value: triageValue?.EnnNoReportedAbnorm == true ? false : triageValue?.EnnNoseBleeds, disabled: triageValue?.EnnNoReportedAbnorm == false ? false : true }],
        EnnNasalStuffiness: [{ value: triageValue?.EnnNoReportedAbnorm == true ? false : triageValue?.EnnNasalStuffiness, disabled: triageValue?.EnnNoReportedAbnorm == false ? false : true }],
        EnnNasalFlaring: [{ value: triageValue?.EnnNoReportedAbnorm == true ? false : triageValue?.EnnNasalFlaring, disabled: triageValue?.EnnNoReportedAbnorm == false ? false : true }],
        EnnFrequentColds: [{ value: triageValue?.EnnNoReportedAbnorm == true ? false : triageValue?.EnnFrequentColds, disabled: triageValue?.EnnNoReportedAbnorm == false ? false : true }],

        EnmNoReportedAbnorm: [{ value: triageValue?.EnmNoReportedAbnorm == true ? true : false, disabled: false }],
        EnmBleedingGums: [{ value: triageValue?.EnmNoReportedAbnorm == true ? false : triageValue?.EnmBleedingGums, disabled: triageValue?.EnmNoReportedAbnorm == false ? false : true }],
        EnmSoreTongue: [{ value: triageValue?.EnmNoReportedAbnorm == true ? false : triageValue?.EnmSoreTongue, disabled: triageValue?.EnmNoReportedAbnorm == false ? false : true }],
        EnmLipColor: [{ value: triageValue?.EnmNoReportedAbnorm == true ? '' : triageValue?.EnmLipColor, disabled: triageValue?.EnmNoReportedAbnorm == false ? false : true }],
        EnmComments: triageValue?.EnmComments ? triageValue?.EnmComments : '',

        NNoReportedAbnorm: [{ value: triageValue?.NNoReportedAbnorm == true ? true : false, disabled: false }],
        NLumps: [{ value: triageValue?.NNoReportedAbnorm == true ? false : triageValue?.NLumps, disabled: triageValue?.NNoReportedAbnorm == false ? false : true }],
        NSwollenGlands: [{ value: triageValue?.NNoReportedAbnorm == true ? false : triageValue?.NSwollenGlands, disabled: triageValue?.NNoReportedAbnorm == false ? false : true }],
        NGoiter: [{ value: triageValue?.NNoReportedAbnorm == true ? false : triageValue?.NGoiter, disabled: triageValue?.NNoReportedAbnorm == false ? false : true }],
        NStiffness: [{ value: triageValue?.NNoReportedAbnorm == true ? false : triageValue?.NStiffness, disabled: triageValue?.NNoReportedAbnorm == false ? false : true }],
        NComments: triageValue?.NComments ? triageValue?.NComments : '',

        BNoReportedAbnorm: [{ value: triageValue?.BNoReportedAbnorm == true ? true : false, disabled: false }],
        BLumps: [{ value: triageValue?.BNoReportedAbnorm == true ? false : triageValue?.BLumps, disabled: triageValue?.BNoReportedAbnorm == false ? false : true }],
        BPain: [{ value: triageValue?.BNoReportedAbnorm == true ? false : triageValue?.BPain, disabled: triageValue?.BNoReportedAbnorm == false ? false : true }],
        BNippleDischarge: [{ value: triageValue?.BNoReportedAbnorm == true ? false : triageValue?.BNippleDischarge, disabled: triageValue?.BNoReportedAbnorm == false ? false : true }],
        BSkinAbnormalities: [{ value: triageValue?.BNoReportedAbnorm == true ? false : triageValue?.BSkinAbnormalities, disabled: triageValue?.BNoReportedAbnorm == false ? false : true }],
        BComments: triageValue?.BComments ? triageValue?.BComments : '',

        RNoReportedAbnorm: [{ value: triageValue?.RNoReportedAbnorm == true ? true : false, disabled: false }],
        RShortnessBreath: [{ value: triageValue?.RShortnessBreath == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RCough: [{ value: triageValue?.RCough == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RWheezing: [{ value: triageValue?.RWheezing == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RCoughingBlood: [{ value: triageValue?.RCoughingBlood == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RProductionPhlegm: [{ value: triageValue?.RProductionPhlegm == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RChestPain: [{ value: triageValue?.RChestPain == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RFever: [{ value: triageValue?.RFever == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RNightSweats: [{ value: triageValue?.RNightSweats == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RBlueFingersToes: [{ value: triageValue?.RBlueFingersToes == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RSwellingHandsFeet: [{ value: triageValue?.RSwellingHandsFeet == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RBronchitisEmphysema: [{ value: triageValue?.RBronchitisEmphysema == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RHxHeartMedication: [{ value: triageValue?.RHxHeartMedication == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RSkippingHeartBeats: [{ value: triageValue?.RSkippingHeartBeats == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RHeartMurmur: [{ value: triageValue?.RHeartMurmur == true ? false : triageValue?.BLumps, disabled: triageValue?.RNoReportedAbnorm == false ? false : true }],
        RComments: triageValue?.RComments ? triageValue?.RComments : '',

        GNoReportedAbnorm: [{ value: triageValue?.GNoReportedAbnorm == true ? true : false, disabled: false }],
        GChangeAppetiteWeight: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GChangeAppetiteWeight, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GProblemsSwallowing: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GProblemsSwallowing, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GNausea: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GNausea, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GHeartburn: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GHeartburn, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GVomiting: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GVomiting, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GVomitingBlood: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GVomitingBlood, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GConstipation: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GConstipation, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GDiarrhea: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GDiarrhea, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GChangeBowelHabits: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GChangeBowelHabits, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GAbdominalPain: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GAbdominalPain, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GExcessiveBelching: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GExcessiveBelching, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GExcessiveFlatus: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GExcessiveFlatus, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GFoodIntolerance: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GFoodIntolerance, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GRectalBleedingHemo: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GRectalBleedingHemo, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GYellowColourSkin: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GYellowColourSkin, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GToiletTrained: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GToiletTrained, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GTfreq: [{ value: triageValue?.GNoReportedAbnorm == true ? '' : triageValue?.GTfreq, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GUsesDiaper: [{ value: triageValue?.GNoReportedAbnorm == true ? false : triageValue?.GUsesDiaper, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GUfreq: [{ value: triageValue?.GNoReportedAbnorm == true ? '' : triageValue?.GUfreq, disabled: triageValue?.GNoReportedAbnorm == false ? false : true }],
        GComments: triageValue?.GComments ? triageValue?.GComments : '',

        UNoReportedAbnorm: [{ value: triageValue?.UNoReportedAbnorm == true ? true : false, disabled: false }],
        UDifficultyUrination: [{ value: triageValue?.UNoReportedAbnorm == true ? false : triageValue?.UDifficultyUrination, disabled: triageValue?.UNoReportedAbnorm == false ? false : true }],
        UPainBurningUrination: [{ value: triageValue?.UNoReportedAbnorm == true ? false : triageValue?.UPainBurningUrination, disabled: triageValue?.UNoReportedAbnorm == false ? false : true }],
        UFrequentUrinationNight: [{ value: triageValue?.UNoReportedAbnorm == true ? false : triageValue?.UFrequentUrinationNight, disabled: triageValue?.UNoReportedAbnorm == false ? false : true }],
        UUrgentNeedUrinate: [{ value: triageValue?.UNoReportedAbnorm == true ? false : triageValue?.UUrgentNeedUrinate, disabled: triageValue?.UNoReportedAbnorm == false ? false : true }],
        UIncontinenceUrine: [{ value: triageValue?.UNoReportedAbnorm == true ? false : triageValue?.UIncontinenceUrine, disabled: triageValue?.UNoReportedAbnorm == false ? false : true }],
        UDribbling: [{ value: triageValue?.UNoReportedAbnorm == true ? false : triageValue?.UDribbling, disabled: triageValue?.UNoReportedAbnorm == false ? false : true }],
        UDecreasedUrineStream: [{ value: triageValue?.UNoReportedAbnorm == true ? false : triageValue?.UDecreasedUrineStream, disabled: triageValue?.UNoReportedAbnorm == false ? false : true }],
        UBloodUrine: [{ value: triageValue?.UNoReportedAbnorm == true ? false : triageValue?.UBloodUrine, disabled: triageValue?.UNoReportedAbnorm == false ? false : true }],
        UUtiStonesProstate: [{ value: triageValue?.UNoReportedAbnorm == true ? false : triageValue?.UUtiStonesProstate, disabled: triageValue?.UNoReportedAbnorm == false ? false : true }],
        UComments: triageValue?.UComments ? triageValue?.UComments : '',

        PNoReportedAbnorm: [{ value: triageValue?.PNoReportedAbnorm == true ? true : false, disabled: false }],
        PLegCramps: [{ value: triageValue?.PNoReportedAbnorm == true ? false : triageValue?.PLegCramps, disabled: triageValue?.PNoReportedAbnorm == false ? false : true }],
        PVaricoseVeins: [{ value: triageValue?.PNoReportedAbnorm == true ? false : triageValue?.PVaricoseVeins, disabled: triageValue?.PNoReportedAbnorm == false ? false : true }],
        PClotsVeins: [{ value: triageValue?.PNoReportedAbnorm == true ? false : triageValue?.PClotsVeins, disabled: triageValue?.PNoReportedAbnorm == false ? false : true }],
        PComments: triageValue?.PComments ? triageValue?.PComments : '',

        MNoReportedAbnorm: [{ value: triageValue?.MNoReportedAbnorm == true ? true : false, disabled: false }],
        MPain: [{ value: triageValue?.MNoReportedAbnorm == true ? false : triageValue?.MPain, disabled: triageValue?.MNoReportedAbnorm == false ? false : true }],
        MSwelling: [{ value: triageValue?.MNoReportedAbnorm == true ? false : triageValue?.MSwelling, disabled: triageValue?.MNoReportedAbnorm == false ? false : true }],
        MStiffness: [{ value: triageValue?.MNoReportedAbnorm == true ? false : triageValue?.MStiffness, disabled: triageValue?.MNoReportedAbnorm == false ? false : true }],
        MDecreasedJointMotion: [{ value: triageValue?.MNoReportedAbnorm == true ? false : triageValue?.MDecreasedJointMotion, disabled: triageValue?.MNoReportedAbnorm == false ? false : true }],
        MBrokenBone: [{ value: triageValue?.MNoReportedAbnorm == true ? false : triageValue?.MBrokenBone, disabled: triageValue?.MNoReportedAbnorm == false ? false : true }],
        MSeriousSprains: [{ value: triageValue?.MNoReportedAbnorm == true ? false : triageValue?.MSeriousSprains, disabled: triageValue?.MNoReportedAbnorm == false ? false : true }],
        MArthritis: [{ value: triageValue?.MNoReportedAbnorm == true ? false : triageValue?.MArthritis, disabled: triageValue?.MNoReportedAbnorm == false ? false : true }],
        MGout: [{ value: triageValue?.MNoReportedAbnorm == true ? false : triageValue?.MGout, disabled: triageValue?.MNoReportedAbnorm == false ? false : true }],
        MComments: triageValue?.MComments ? triageValue?.MComments : '',

        NuNoReportedAbnorm: [{ value: triageValue?.NuNoReportedAbnorm == true ? true : false, disabled: false }],
        NuHeadaches: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuHeadaches, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuSeizures: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuSeizures, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuParalysis: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuParalysis, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuWeakness: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuWeakness, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuLossConsciousness: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuLossConsciousness, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuLossMuscleSize: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuLossMuscleSize, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuMuscleSpasm: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuMuscleSpasm, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuTremor: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuTremor, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuInvoluntaryMovement: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuInvoluntaryMovement, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuNumbness: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuNumbness, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuIncoordination: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuIncoordination, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuFeelingPinsNeedles: [{ value: triageValue?.NuNoReportedAbnorm == true ? false : triageValue?.NuFeelingPinsNeedles, disabled: triageValue?.NuNoReportedAbnorm == false ? false : true }],
        NuComments: triageValue?.MGout ? triageValue?.NuFeelingPinsNeedles : '',

        HeNoReportedAbnorm: [{ value: triageValue?.HeNoReportedAbnorm == true ? true : false, disabled: false }],
        HeAnemia: [{ value: triageValue?.HeNoReportedAbnorm == true ? false : triageValue?.HeAnemia, disabled: triageValue?.HeNoReportedAbnorm == false ? false : true }],
        HeEasyBruisingBleeding: [{ value: triageValue?.HeNoReportedAbnorm == true ? false : triageValue?.HeEasyBruisingBleeding, disabled: triageValue?.HeNoReportedAbnorm == false ? false : true }],
        HeComments: triageValue?.HeComments ? triageValue?.HeComments : '',

        EdNoReportedAbnorm: [{ value: triageValue?.EdNoReportedAbnorm == true ? true : false, disabled: false }],
        EdAbnormalGrowth: [{ value: triageValue?.EdNoReportedAbnorm == true ? false : triageValue?.EdAbnormalGrowth, disabled: triageValue?.EdNoReportedAbnorm == false ? false : true }],
        EdIncreasedAppetite: [{ value: triageValue?.EdNoReportedAbnorm == true ? false : triageValue?.EdIncreasedAppetite, disabled: triageValue?.EdNoReportedAbnorm == false ? false : true }],
        EdIncreasedThirst: [{ value: triageValue?.EdNoReportedAbnorm == true ? false : triageValue?.EdIncreasedThirst, disabled: triageValue?.EdNoReportedAbnorm == false ? false : true }],
        EdIncreaseUrineProduction: [{ value: triageValue?.EdNoReportedAbnorm == true ? false : triageValue?.EdIncreaseUrineProduction, disabled: triageValue?.EdNoReportedAbnorm == false ? false : true }],
        EdThyroidTrouble: [{ value: triageValue?.EdNoReportedAbnorm == true ? false : triageValue?.EdThyroidTrouble, disabled: triageValue?.EdNoReportedAbnorm == false ? false : true }],
        EdHeatColdIntolerance: [{ value: triageValue?.EdNoReportedAbnorm == true ? false : triageValue?.EdHeatColdIntolerance, disabled: triageValue?.EdNoReportedAbnorm == false ? false : true }],
        EdExcessingSweating: [{ value: triageValue?.EdNoReportedAbnorm == true ? false : triageValue?.EdExcessingSweating, disabled: triageValue?.EdNoReportedAbnorm == false ? false : true }],
        EdDiabetes: [{ value: triageValue?.EdNoReportedAbnorm == true ? false : triageValue?.EdDiabetes, disabled: triageValue?.EdNoReportedAbnorm == false ? false : true }],
        EdComments: triageValue?.EdComments ? triageValue?.EdComments : '',

        PsNoReportedAbnorm: [{ value: triageValue?.PsNoReportedAbnorm == true ? true : false, disabled: false }],
        PsTensionAnxiety: [{ value: triageValue?.PsNoReportedAbnorm == true ? false : triageValue?.PsTensionAnxiety, disabled: triageValue?.PsNoReportedAbnorm == false ? false : true }],
        PsDepressionSuicide: [{ value: triageValue?.PsNoReportedAbnorm == true ? false : triageValue?.PsDepressionSuicide, disabled: triageValue?.PsNoReportedAbnorm == false ? false : true }],
        PsMemoryProblems: [{ value: triageValue?.PsNoReportedAbnorm == true ? false : triageValue?.PsMemoryProblems, disabled: triageValue?.PsNoReportedAbnorm == false ? false : true }],
        PsPastTreatmentPsychiatri: [{ value: triageValue?.PsNoReportedAbnorm == true ? false : triageValue?.PsPastTreatmentPsychiatri, disabled: triageValue?.PsNoReportedAbnorm == false ? false : true }],
        PsSleepProblems: [{ value: triageValue?.PsNoReportedAbnorm == true ? false : triageValue?.PsSleepProblems, disabled: triageValue?.PsNoReportedAbnorm == false ? false : true }],
        PsUnusualProblems: [{ value: triageValue?.PsNoReportedAbnorm == true ? false : triageValue?.PsUnusualProblems, disabled: triageValue?.PsNoReportedAbnorm == false ? false : true }],
        PsChangeMood: [{ value: triageValue?.PsNoReportedAbnorm == true ? false : triageValue?.PsChangeMood, disabled: triageValue?.PsNoReportedAbnorm == false ? false : true }],
        PsComments: triageValue?.PsComments ? triageValue?.PsComments : '',

        DocStatus: [{ value: this.documentStatus, disabled: false }],
      });
    }
  }

  public statusDraftDocDetails(docKey) {
    // Subscribe using an object to define handlers
    this.emergencyService.getTriageDataIfStatusDraftForDetails(docKey).subscribe({
      next: (res: any) => {
        // Handle successful data retrieval
        this.formDetails = res?.d?.results[0];
        this.patchValuetoFormDate(this.formDetails);
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
        });
      },
      error: (error: any) => {
        // Handle errors if the request fails
        this.sharedService.waringSwallModel(`POST Error : ${error?.error?.error?.message?.value}`);
      },
      complete: () => {
        // Handle completion (optional), invoked when the observable completes
        // resolve(true); // Resolve the promise with formValue;
        console.log('completed');
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

  private getTiragePriorityList() {
    const json = { "patnr": this.paramsObject.patnr, "falnr": this.paramsObject.falnr };
    this.emergencyService.triagePriorityList(json).subscribe({
      next: (data: any) => {
        // Handle successful data retrieval
        // console.log(data);
        this.selectedTriageDetails = data?.d?.results[0];
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error Data:', err);
      },
      complete: () => {
        // Handle completion (optional), invoked when the observable completes
        // console.log('Complete');
      }
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

  isDockeyAvailable(): boolean {
    return this.scalesList.some(scale => scale.Dockey && scale.Dockey.trim() !== '');
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
    const selfCaringNoProblemIdentifyControlList = ['FunSelfNeedsSuper', 'FunSelfNeedsFeeding', 'FunSelfNeedsHygiene', 'FunSelfNeedsToileting', 'FunSelfNeedsAmulation'];
    const selfCaringNeedSupervisionControlList = ['FunSelfNoProblem'];
    if (type == this.AssessmentType.NoProblemIdentified$ && event.target.checked) {
      selfCaringNoProblemIdentifyControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.disable();
          selectControl.setValue('');
        }
      })
    } else {
      selfCaringNoProblemIdentifyControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.enable();
        }
      });
    }

    if (type == this.AssessmentType.NeedSupervision$ && event.target.checked) {
      selfCaringNeedSupervisionControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.disable();
          selectControl.setValue('');
        }
      })
    } else {
      selfCaringNeedSupervisionControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.enable();
        }
      });
    }
  }

  public changeMusculoskeletal(event, type: string) {
    const musculoskeletalNoProblemIdentifyControlList = ['FunMusProblemIdentified', 'FunMusProblems'];
    const musculoskeletalProblemIdentifyControlList = ['FunMusNoProblem'];
    if (type == this.AssessmentType.NoProblemIdentifiedM$ && event.target.checked) {
      musculoskeletalNoProblemIdentifyControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.disable();
          selectControl.setValue('');
        }
      })
    } else {
      musculoskeletalNoProblemIdentifyControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.enable();
        }
      });
    }

    if (type == this.AssessmentType.ProblemIdentifiedM$ && event.target.checked) {
      musculoskeletalProblemIdentifyControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.disable();
          selectControl.setValue('');
        }
      })
    } else {
      musculoskeletalProblemIdentifyControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.enable();
        }
      });
    }
  }

  public changeEquipmentAssignment(event, type: string) {
    const equipmentControlList = ['FunAssEquipmentUseOf', 'FunAssEquipmentUseOfTyp'];
    const noEquipmentControlList = ['FunAssEquipmentNone'];
    if (type == this.AssessmentType.NoEquipment$ && event.target.checked) {
      equipmentControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.disable();
          selectControl.setValue('');
        }
      })
    } else {
      equipmentControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.enable();
        }
      });
    }

    if (type == this.AssessmentType.UseOfEquipment$ && event.target.checked) {
      noEquipmentControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.disable();
          selectControl.setValue('');
        }
      })
    } else {
      noEquipmentControlList.forEach((item) => {
        const selectControl = this.triageForm.get(item);
        if (selectControl) {
          selectControl.enable();
        }
      });
    }
    // if (type == AssessmentType.NoEquipment$) {
    //   this.triageForm.patchValue({
    //     FunAssEquipmentNone: true,
    //     FunAssEquipmentUseOf: false,
    //   });
    // } else {
    //   this.triageForm.patchValue({
    //     FunAssEquipmentNone: false,
    //     FunAssEquipmentUseOf: true,
    //   });
    // }
  }

  public changeUseEquipment(event) {
    const selectControl = this.triageForm.get('FunAssEquipmentUseOfTxt');
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
    this.triageForm.get('NutRiskScore').patchValue(sumOfValues);
    this.scoreLabel(sumOfValues);
  }

  private scoreLabel(value: number) {
    if (value == 0) {
      this.triageForm.get('NutRiskLevel').patchValue('No risk');
    } else if (value > 1 && value < 4) {
      this.triageForm.get('NutRiskLevel').patchValue('Low risk');
    } else if (value > 5 && value < 7) {
      this.triageForm.get('NutRiskLevel').patchValue('Moderate risk');
    } else if (value > 7) {
      this.triageForm.get('NutRiskLevel').patchValue('High risk');
    }

  }

  public changeNutAppetite(event: any) {
    if (event == 4) {
      this.triageForm.get('NutAppetiteTxt').enable();
    } else {
      this.triageForm.get('NutAppetiteTxt').disable();
    }
  }

  public changeAppearance(event: any) {
    if (event == 4) {
      this.triageForm.get('NutAppearanceTxt').enable();
    } else {
      this.triageForm.get('NutAppearanceTxt').disable();
    }
  }

  public changeSupport(event: any) {
    if (event == 4) {
      this.triageForm.get('NutSupportTxt').enable();
    } else {
      this.triageForm.get('NutSupportTxt').disable();
    }
  }

  public changeDiet(event: any) {
    if (event == 3) {
      this.triageForm.get('NutDietTxt').enable();
    } else {
      this.triageForm.get('NutDietTxt').disable();
    }
  }

  public changeDefficulties(event: any) {
    if (event == 6) {
      this.triageForm.get('NutFeedingTxt').enable();
    } else {
      this.triageForm.get('NutFeedingTxt').disable();
    }
  }

  public changeCannotbeAssessed(event) {
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
    if (event.target.checked) {
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
  }

  public changeReviewofSystem(tabName: any) {

    this.activeReviewSystemTab = tabName; // Set active tab label
    // Perform any other actions when a tab is clicked
  }

  public handleControlChangesbyTab(event, controlName: string, issueList: any[], relatedControlName?: string[]): void {
    console.log();
    if (this.triageForm.contains(controlName)) {
      if (event.target.checked) {
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
    } else {
      console.error(`Control ${controlName} does not exist in triageForm.`);
    }

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

  public directReleaseNReleaseEmergencyNursingDocument(DocStatus: any) {
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
      payload.DocStatus = DocStatus;
      // Subscribe using an object to define handlers
      this.subscription = this.emergencyService.saveNurEmrTriage(payload).subscribe({
        next: (data: any) => {
          // Handle successful data retrieval
          this.updateTriageStatus();
          this.sharedService.successSwallModel('Triage form done successfully');
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

  public updateTriageStatus() {
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
      TriageColor: this.triageList.filter((item) => item.TriagePriorityCode == this.triageForm.value.TriagePriority)[0].TriageColor,
      TriagePriorityCode: this.triageList.filter((item) => item.TriagePriorityCode == this.triageForm.value.TriagePriority)[0].TriagePriorityCode,
      TriagePriorityText: this.triageList.filter((item) => item.TriagePriorityCode == this.triageForm.value.TriagePriority)[0].label,
      Zimmr: "",
      Mode: true,
    }
    this.emergencyService.saveTriage(payload).subscribe({
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
