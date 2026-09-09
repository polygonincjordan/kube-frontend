export interface NoReleasedMissedDocuments {
  d: List
}

export interface List {
  results: NoReleasedMissedDocumentsDetails[]
}

export interface NoReleasedMissedDocumentsDetails {
  __metadata: Metadata
  Einri: string
  Falnr: string
  Date: string
  Time: string
  Status: string
  Roomid: string
  Patient: string
  Nurse: string
  Physician: string
  Financecategory: string
  StatusText: string
  NurseName: string
  PatientName: string
  RoomidText: string
  PhysicianName: string
  FinancecategoryName: string
  TriagePriorityStatus: string
  TriagePriorityDoknr: string
  EmergencyNursingStatus: string
  EmergencyNursingDoknr: string
  NrsScaleStatus: string
  NrsScaleDoknr: string
  GlasgowScaleStatus: string
  GlasgowScaleDoknr: string
  BradenScaleStatus: string
  BradenScaleDoknr: string
  EducationAssessStatus: string
  EducationAssessDoknr: string
  FacePainScaleStatus: string
  FacePainScaleDoknr: string
}

export interface Metadata {
  id: string
  uri: string
  type: string
}
