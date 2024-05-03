export interface TriageList {
  d: D
}

export interface D {
  results: TriageDetails[]
}

export interface TriageDetails {
  __metadata: Metadata
  Dockey: string
  Dtid: string
  Einri: string
  Patnr: string
  Falnr: string
  Lfdnr: string
  Orgdo: string
  ArrivalMode: string
  ArrivalModeTxt: string
  Accompanied: string
  AccompaniedTxt: string
  Language: string
  TriagePriority: string
  ArrivalTime: string
  ChiefComplaint: string
  SNoReportedAbnorm: boolean
  SRashes: boolean
  STypeRash: string
  SItching: boolean
  SChangeHairNails: boolean
  SComments: string
  HNoReportedAbnorm: boolean
  HHeadInjury: boolean
  HHeadCircumference: string
  HComments: string
  ENoReportedAbnorm: boolean
  EGlassesContacts: boolean
  EChangeVision: boolean
  EEyePain: boolean
  EDoubleVision: boolean
  EFlashingLights: boolean
  EGlaucomaCataracts: boolean
  ELastEyeExam: boolean
  EComments: string
  EneNoReportedAbnorma: boolean
  EneChangeHearing: boolean
  EneTympanicMembrane: boolean
  EneEarDischarge: boolean
  EneRinging: boolean
  EneDizziness: boolean
  EnnNoReportedAbnorm: boolean
  EnnNoseBleeds: boolean
  EnnNasalStuffiness: boolean
  EnnFrequentColds: boolean
  EnnNasalFlaring: boolean
  EnmNoReportedAbnorm: boolean
  EnmBleedingGums: boolean
  EnmSoreTongue: boolean
  EnmHoarseness: boolean
  EnmLipColor: string
  EnmComments: string
  NNoReportedAbnorm: boolean
  NLumps: boolean
  NSwollenGlands: boolean
  NGoiter: boolean
  NStiffness: boolean
  NComments: string
  BNoReportedAbnorm: boolean
  BLumps: boolean
  BPain: boolean
  BNippleDischarge: boolean
  BSkinAbnormalities: boolean
  BComments: string
  RNoReportedAbnorm: boolean
  RShortnessBreath: boolean
  RCough: boolean
  RWheezing: boolean
  RCoughingBlood: boolean
  RProductionPhlegm: boolean
  RChestPain: boolean
  RFever: boolean
  RNightSweats: boolean
  RBlueFingersToes: boolean
  RSwellingHandsFeet: boolean
  RBronchitisEmphysema: boolean
  RHeartMurmur: boolean
  RHxHeartMedication: boolean
  RSkippingHeartBeats: boolean
  RComments: string
  GNoReportedAbnorm: boolean
  GChangeAppetiteWeight: boolean
  GProblemsSwallowing: boolean
  GNausea: boolean
  GHeartburn: boolean
  GVomiting: boolean
  GVomitingBlood: boolean
  GConstipation: boolean
  GDiarrhea: boolean
  GChangeBowelHabits: boolean
  GAbdominalPain: boolean
  GExcessiveBelching: boolean
  GExcessiveFlatus: boolean
  GYellowColourSkin: boolean
  GFoodIntolerance: boolean
  GRectalBleedingHemo: boolean
  GToiletTrained: boolean
  GTfreq: string
  GUsesDiaper: boolean
  GUfreq: string
  GComments: string
  UNoReportedAbnorm: boolean
  UDifficultyUrination: boolean
  UPainBurningUrination: boolean
  UFrequentUrinationNight: boolean
  UUrgentNeedUrinate: boolean
  UIncontinenceUrine: boolean
  UDribbling: boolean
  UDecreasedUrineStream: boolean
  UBloodUrine: boolean
  UUtiStonesProstate: boolean
  UComments: string
  PNoReportedAbnorm: boolean
  PLegCramps: boolean
  PVaricoseVeins: boolean
  PClotsVeins: boolean
  PComments: string
  MNoReportedAbnorm: boolean
  MPain: boolean
  MSwelling: boolean
  MStiffness: boolean
  MDecreasedJointMotion: boolean
  MBrokenBone: boolean
  MSeriousSprains: boolean
  MArthritis: boolean
  MGout: boolean
  MComments: string
  NuNoReportedAbnorm: boolean
  NuHeadaches: boolean
  NuSeizures: boolean
  NuLossConsciousness: boolean
  NuParalysis: boolean
  NuWeakness: boolean
  NuLossMuscleSize: boolean
  NuMuscleSpasm: boolean
  NuTremor: boolean
  NuInvoluntaryMovement: boolean
  NuIncoordination: boolean
  NuNumbness: boolean
  NuFeelingPinsNeedles: boolean
  NuComments: string
  HeNoReportedAbnorm: boolean
  HeAnemia: boolean
  HeEasyBruisingBleeding: boolean
  HeComments: string
  EdNoReportedAbnorm: boolean
  EdAbnormalGrowth: boolean
  EdIncreasedAppetite: boolean
  EdIncreasedThirst: boolean
  EdIncreaseUrineProduction: boolean
  EdThyroidTrouble: boolean
  EdHeatColdIntolerance: boolean
  EdExcessingSweating: boolean
  EdDiabetes: boolean
  EdComments: string
  PsNoReportedAbnorm: boolean
  PsTensionAnxiety: boolean
  PsDepressionSuicide: boolean
  PsMemoryProblems: boolean
  PsUnusualProblems: boolean
  PsSleepProblems: boolean
  PsPastTreatmentPsychiatri: boolean
  PsChangeMood: boolean
  PsComments: string
  PsyNoProblem: boolean
  PsyAnxious: boolean
  PsyUncooperative: boolean
  PsyDepressed: boolean
  PsyAngry: boolean
  PsyAgitated: boolean
  PsyCombative: boolean
  PsyOther: boolean
  PsyComments: string
  OccOccupationalStatus: string
  OccOccupationalStatusTxt: string
  OccJobNature: string
  OccHealthProblems: string
  OccHealthProblemsTxt: string
  OccHealthInjury: string
  OccHealthInjuryTxt: string
  OccJob: string
  OccJobTxt: string
  OccDailyNeeds: string
  OccDailyNeedsTxt: string
  OccSpouseWork: string
  OccSpouseWorkTxt: string
  OccComments: string
  EcoLiving: string
  EcoNoPeople: string
  EcoRelationship: string
  EcoRelationshipTxt: string
  EcoPhone: string
  EcoFatherJob: string
  EcoInsurance: string
  FunSelfNoProblem: boolean
  FunSelfNeedsSuper: boolean
  FunSelfNeedsFeeding: boolean
  FunSelfNeedsHygiene: boolean
  FunSelfNeedsToileting: boolean
  FunSelfNeedsAmulation: boolean
  FunMusNoProblem: boolean
  FunMusProblemIdentified: boolean
  FunMusProblems: string
  FunAssEquipmentNone: boolean
  FunAssEquipmentUseOf: boolean
  FunAssEquipmentUseOfTyp: string
  FunAssEquipmentUseOfTxt: string
  FunDrNotification: string
  FunNotified: string
  NutDiabetes: boolean
  NutPregnancy: boolean
  NutHepatitis: boolean
  NutMalnutrition: boolean
  NutUnderweight: boolean
  NutHiv: boolean
  NutHtn: boolean
  NutCopd: boolean
  NutChf: boolean
  NutCad: boolean
  NutGiDisorder: boolean
  NutEatingDisorder: boolean
  NutFoodAllergies: boolean
  NutChewingProblems: boolean
  NutChronicConstipation: boolean
  NutLowAlbumin: boolean
  NutVomitting: boolean
  NutDiarrhea: boolean
  NutRiskScore: string
  NutRiskLevel: string
  NutAppetite: string
  NutAppetiteTxt: string
  NutAppearance: string
  NutAppearanceTxt: string
  NutLast1Month: string
  NutSupport: string
  NutSupportTxt: string
  NutLast3Month: string
  NutDiet: string
  NutDietTxt: string
  NutBmi: string
  NutFeeding: string
  NutFeedingTxt: string
  NutDrNotification: string
  NutNotified: string
  NutComments: string
  SocScreening: string
  SocCurrent: boolean
  SocPrevious: boolean
  CommCough: string
  CommFever: string
  CommNightSweats: string
  CommWeightLoss: string
  AttendPhy: string
  DocStatus: string
  TOALLERGIES: Toallergies
  TOSCALE: Toscale
  TOINFECTION: Toinfection
  TOVITALSIGNS: Tovitalsigns
  TOSOCIAL: Tosocial
  TOVACCIN: Tovaccin
  TOPHYEXAM: Tophyexam
}

export interface Metadata {
  id: string
  uri: string
  type: string
}

export interface Toallergies {
  results: Result2[]
}

export interface Result2 {
  __metadata: Metadata2
  Dockey: string
  Agroup: string
  Description: string
}

export interface Metadata2 {
  id: string
  uri: string
  type: string
}

export interface Toscale {
  results: Result3[]
}

export interface Result3 {
  __metadata: Metadata3
  Dockey: string
  ScaleType: string
  LastScore: string
  ScoreDesc: string
  Datetimee: string
}

export interface Metadata3 {
  id: string
  uri: string
  type: string
}

export interface Toinfection {
  results: any[]
}

export interface Tovitalsigns {
  results: any[]
}

export interface Tosocial {
  results: any[]
}

export interface Tovaccin {
  results: any[]
}

export interface Tophyexam {
  results: any[]
}
