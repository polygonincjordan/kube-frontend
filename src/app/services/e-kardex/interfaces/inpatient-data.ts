export interface InPatientDataResult {
  __metadata: InpatientMetaData;
  DocKey: string;
  Dodat: string;
  Dokst: string;
  Dokvr: string;
  Dtid: string;
  DtidText: string;
  Einri: string;
  Erdattim: string;
  Etag: string;
  Falnr: string;
  Lfdnr: string;
  Mitarb: string;
  Mitarbname: string;
  Orgdo: string;
  Patnr: string;
  Referredby: string;
  Released: boolean;
  Visitdate: null;
  DataType?: string;
  DOCCATTOATTACHMENTS: {
    results: DocAttachment[];
  };
  PATDOCTOOPERRPTDOCDETAIL: {
    results: FormConfigData[];
  };
  PATDOCTOPOSTOPERATIVEDX: {
    results: DiagnosesData[];
  };
  PATDOCTOPREOPERATIVEDX: {
    results: DiagnosesData[];
  };
  PATDOCTOSURGICALTEAM: {
    results: SurgeryTeamData[];
  };
}

export interface DocAttachment {
  ApplicationId: string;
  AttMimeType: string;
  AttachmentData: string;
  CreatedAt: null;
  Description: string;
  DocKey: string;
  FileId: string;
  FileName: string;
}

export interface FormConfigData {
  AnesthesiaType: string;
  AnticipatedComplications: string;
  BloodLoss: string;
  BloodTransfused: string;
  Complications: string;
  DateOfReportEntry: null;
  DateOfSurgery: null;
  Description: string;
  DocKey: string;
  Findings: string;
  IndicationForSurgery: string;
  OperationPerformed: string;
  OperativeComplication: string;
  PostOperativeDiagnosis: string;
  PreOperativeDiagnosis: string;
  ProcedureName: string;
  ProcedureRemarks: string;
  Specimen: string;
  SpecimenRemoved: string;
  TimeOfReportEntry: string;
  TimeOfSurgery: string;
}


export class SurgeryTeamData {
  DocKey: string;
  ItemId: string;
  Code: string;
  Description: string;
  EmployeeResponsible: string;
  EmployeeName: string;
  DateIn: string;
  DateOut: string;
  TimeIn: string;
  TimeOut: string;
  CaseNumber: string;
  SequenceNumberMovem: string;
  ServiceSequenceNumber: string;

  Dockey?: string;
  __metadata?: object;
  NewDateIn?: string;
  NewDateOut?: string;

  isSelected?: boolean = false;
}

export class DiagnosesData {
  Id: string;
  CatalogDx: string;
  Code: string;
  Description: string;
  Institution: string;
  PatientNumber: string;
  CaseNumber: string;

  __metadata?: object;
  DocKey?: string;
  Remarks?: string;
  DiagnosesOrder?: number;
  AdmissionDxInd?: boolean;
  DischargeDxInd?: boolean;
  WorkingDxInd?: boolean;
  PreoperativeDxInd?: boolean;
  SurgeryDxInd?: boolean;
  CauseOfDeathInd?: boolean;
  DepartmentMainDxInd?: boolean;
  HospitalMainDxIn?: boolean;


  isSelected: boolean = false;
}
export interface InpatientMetaData {
  id: string;
  uri: string;
  type: string;
}
