export interface HospitalistType {
  AbsencesInd: string;
  AdmDateFrom: any;
  AdmDateTo: any;
  Admdatetime: string;
  AdmissionDate: string;
  AdmissionDays: number;
  AdmissionTime: string;
  Allergies: string;
  AttendingDoctor: string;
  AttendingDoctorName: string;
  Bediconcolor: string;
  Bedid: string;
  BedidText: string;
  Bekat: string;
  CaseNumber: string;
  CaseTypeText: string;
  ClinicalOrderInd: string;
  DaysIc: string;
  Deptou: string;
  DeptouDesc: string;
  Diagnosis: string;
  DiagnosisTreatment: string;
  DietStatus: string;
  DischargeDatePlan: any;
  DischargeDate: any;
  EmergencyAdmInd: string;
  ExistingDocuments: string;
  FinancialCategory: string;
  Floor: string;
  Institute: string;
  IsolationInd: string;
  IsolationType: string;
  Kostr: string;
  LabDocInd: string;
  Lfdnr: string;
  MedDocInd: string;
  Mrn: string;
  PatientAge: string;
  PatientDob: string;
  PatientGender: string;
  PatientName: string;
  Patientstatus: string;
  PatientstatusAdmitted: string;
  PatientstatusDischarged: string;
  PatientstatusNewadm: string;
  PatientstatusPlandischarg: string;
  PatientstatusRecentdischarg: string;
  Patname: string;
  PhysicianOrdersRelease: string;
  PrivatePatientIcon: string;
  RiskIconInd: string;
  RiskInformation: string;
  Roomid: string;
  RoomidText: string;
  SpecialInd: string;
  StudyFlag: string;
  StudyStatus: string;
  SurgeryLastDate: any;
  SurgeryLastDays: string;
  TreatmentCategory: string;
  Typ: string;
  VipIcon: string;
  __metadata: HospitalistMetaDataType;
}

export interface AttendingPhysician {
  AdmDateFrom: string;
  AdmDateTo: string;
  Floor: string;
  Gpart: string;
  Name: string;
  Typ: string;
  __metadata: HospitalistMetaDataType;
}

export interface WardList {
  Name: string;
  Ward: string;
  __metadata: HospitalistMetaDataType;
}

export interface HospitalistDataCount {
  Admissions: number;
  Newadmissions: number;
  Planneddischarges: number;
  Discharges: number;
  Dialysis: number;
  ldrBirthUnit: number;
  CountChartAdm: CountResults;
  CountChartDischarge: CountResults;
  CountChartLabel: CountResults;
  CountChartNewAdm: CountResults;
  CountChartPlanDischarge: CountResults;
  CountChartPldrBirthUnit: CountResults;
}

export interface CountResults {
  results: Array<CountData>;
}

export interface CountData {
  Count: number;
  Name: string;
  Typ: string;
}

export interface HospitalistMetaDataType {
  id: string;
  type: string;
  uri: string;
}
