export interface PatientVisitData {
  d: PatientVisitDataRoot;
}

export interface PatientVisitDataRoot {
  results: PatientVisitDataResult[];
}

export interface PatientVisitDataResult {
  __metadata: MetaDataMain;
  DocKey: string;
  DtidText: string;
  Dokvr: string;
  Subjective: string;
  Objective: string;
  Plann: string;
  Srcapp: string;
  Dtid: string;
  Erdattim: string;
  Etag: string;
  Mitarb: string;
  Mitarbname: string;
  Einri: string;
  Patnr: string;
  Falnr: string;
  Orgdo: string;
  Lfdnr: string;
  VisitDate?: string;
  ReferredBy: string;
  ReasonForVisit: string;
  Assessment: string;
  Assessmenttext: string;
  TranscriberText: string;
  Released: string;
  VISITTOATTACHMENTS: Visittoattachments;
  VISITTODIAGNOSIS: Visittodiagnosis;
  DOCCATTOATTACHMENTS?: Visittoattachments;
}

export interface PatientVisitUpdateDataPayload {
  DocKey: string;
  Subjective: string;
  Objective: string;
  Plann: string;
  Srcapp: string;
  Etag: string;
  Einri: string;
  Patnr: string;
  Falnr: string;
  Lfdnr: string;
  VisitDate?: string;
  ReferredBy: string;
  ReasonForVisit: string;
  Assessment: string;
  TranscriberText: string;
  Released: string; // for save "" ? release "x"

  VISITTOATTACHMENTS: Visittoattachments;
  VISITTODIAGNOSIS: Visittodiagnosis;
}

export interface MetaDataMain {
  id: string;
  uri: string;
  type: string;
  etag: string;
}

export interface Visittoattachments {
  results: any[];
}

export interface VisittoattachmentsResult {
  __metadata: Metadata;
  DocKey: string;
  FileID: string;
  ApplicationID: string;
  Description: string;
  AttachmentData: string;
  AttMimeType: string;
  CreatedAt: string;
  FileName: string;
}

export interface Visittodiagnosis {
  results: VisittodiagnosisResult[];
}

export interface VisittodiagnosisResult {
  __metadata?: Metadata;
  DocKey: string;
  einri: string;
  falnr: string;
  DiagMvmntSeq: string;
  movmntSeq: string;
  code: string;
  secndDia: string;
  text: string;
  freeText?: boolean;
  codeText?: string;
}

export interface Metadata {
  id: string;
  uri: string;
  type: string;
}

export enum DocType {
  ZMED_SOAP = 'ZMED_SOAP',
  ZMED_MEDRP = 'ZMED_MEDRP',
  ZMED_VISIT = 'ZMED_VISIT',
}


export interface PatientCaseSetDataType {
  __metadata: {
    id: string;
    uri: string;
    type: string;
  };
  Patient: string;
  DeptUnitName: string;
  PersonName: string;
  Einri: string;
  Person: string;
  Case: string;
  CaseType: string;
  MovementType: string;
  StartDate: string | null;
  EndDate: string | null;
  DeptUnit: string;
}

export interface ReleaseHistoryDataType {
  __metadata: {
    id: string;
    uri: string;
    type: string;
  };
  Released: boolean;
  Dodat: string;
  Visitdate: string;
  Erdattim: string;
  DocKey: string;
  Dtid: string;
  DtidText: string;
  Dokst: string;
  Dokvr: string;
  Einri: string;
  Patnr: string;
  Falnr: string;
  Orgdo: string;
  Lfdnr: string;
  Referredby: string;
  Mitarbname: string;
  Mitarb: string;
  Etag: string;
}
