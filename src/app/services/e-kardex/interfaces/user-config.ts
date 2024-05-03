import { Metadata } from '../interfaces/patient-visit-data';

export interface UserConfig {
  __metadata: Metadata;
  UserId: string;
  VMA: string;
  ComponentName: string;
  DefaultNewDocumentVisitNote: boolean;
  DefaultNewDocumentSOAP: boolean;
  DocumentTypeVisitNote: boolean;
  DocumentTypeSOAP: boolean;
  DocumentTypeMedicalReport: boolean;
  DocumentStatusReleased: boolean;
  DocumentStatusDraft: boolean;
  PeriodParameterMonth: string;
  PeriodParameterFromDate?: string;
  PeriodParameterToDate?: string;
  ShowAllDocument: boolean;
}

export interface PeriodParameterType {
  month?: boolean;
  date?: boolean;
}
