export enum UserType {
  Physician = 'Physician',
  FloorHospitalist = 'FloorHospitalist',
  ERHospitalist = 'ERHospitalist',
  FloorNurse = 'FloorNurse',
  ERNurse = 'ERNurse',
  EPatient = 'EPatient',
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
  TRASM$ = 'TRASM',
  NMRTSC$ = 'NMRTSC',
  COMMA$ = 'COMA',
  BRADEN$ = 'BRADEN',
  EDUAS$ = 'EDUAS',
  FAC$ = 'FAC'
}

export enum AssessmentType {
  NoProblemIdentified$ = 'No Problem Identified',
  NeedSupervision = 'Needs supervision / Totally Dependent',
  ProblemIdenfify$ = 'Problem Idenfify',
  NoEquipment$ = 'No Equipment',
  UseOfEquipment$ = 'Use Of Equipment'
}
