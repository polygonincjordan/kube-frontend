export enum UserType {
  Physician = 'Physician',
  FloorHospitalist = 'FloorHospitalist',
  ERHospitalist = 'ERHospitalist',
  FloorNurse = 'FloorNurse',
  ERNurse = 'ERNurse',
  opnurse = 'OPNurse',
  Pharmacist = 'Pharmacist',
  SeniorPhysician = 'SeniorPhysician',
  SeniorHospitalist = 'SeniorHospitalist',
  Community = 'Community',
  PartTime = 'PartTime',
  DIYNurse = "DIYNurse"
}


export enum ActionType {
  Add$ = "Add",
  Save$ = "Save",
  Remove$ = "Remove",
  Update$ = "Update",
  Copy$ = "Copy",
  Reset$ = "Reset",
  Cancel$ = "Cancel",
  View$ = 'View'
}


export enum WordType {
  MaterialCode$ = "MaterialCode",
  MaterialName$ = "MaterialName",
  CreateNewFeeServiceOrder = 'CreateNewFeeServiceOrder',
  EditGGCS = 'EditGlosgowCommaScale',
  EditFPS = 'EditFacePainScale',
  EditNRS = 'EditNumericRatingScale',
  EditBS = 'EditBradenScale',
  EditEA = 'EditEducationAssessment',
  EditNE = 'EditNurseEndorsment',
  EditEND = 'EditEmergencyNursingDocument',
  CopyEA = 'CopyEducationAssessment',
  CopyNED = 'CopyEmergencyNursingDocument',
  CopyGGCS = 'CopyGlosgowCommaScale',
  CopyFPS = 'CopyFacePainScale',
  CopyNRS = 'CopyNumericRatingScale',
  CopyBS = 'CopyBradenScale',
  CopyEND = 'CopyEmergencyNursingDocument',
}


export enum FilterType {
  PatientWithNoConsumable$ = 'PatientWithNoConsumable',
  PatientWithNoDocuments$ = 'PatientWithNoDocuments',
  OpCheckIn$ = 'OPCheckIn',
  OpErHistory$ = 'OpErHistory',
  ConsumableStorageLocation$ = 'ConsumableStorageLocation',
  FeeServiceSet$ = 'FeeServiceSet',
  FeeServiceList$ = 'FeeServiceList',
}

export enum RedirectionType {
  TRASM$ = 'TRASM', // Emergency Nursing Document
  NMRTSC$ = 'NMRTSC', //NRS Scale
  COMMA$ = 'COMA', // Glasgow Coma Scale
  BRADEN$ = 'BRADEN', // Braden Scale
  EDUAS$ = 'EDUAS', // Education Assessment
  FAC$ = 'FAC' // Face Paing Scale
}

export enum AssessmentType {
  NoProblemIdentified$ = 'No Problem Identified',
  NeedSupervision$ = 'Needs supervision / Totally Dependent',
  NoProblemIdentifiedM$ = 'No Problem Idenfify',
  ProblemIdentifiedM$ = 'Problem Idenfify',
  NoEquipment$ = 'No Equipment',
  UseOfEquipment$ = 'Use Of Equipment'
}
