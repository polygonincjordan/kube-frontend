export interface TemplateModel {
  Templatetxt: string;
  Templatelevel: string;
  TemplateHeaderItem: TemplateHeaderItemModel;
}

export interface TemplateHeaderItemModel {
  results: TemplateResultModel[];
}

export interface TemplateResultModel {
  ProfGroup: string;
  ZphysOrder: string;
}

export interface ProgressNotesCategoryModel {
  CatId: string;
  CatText: string;
  __metadata: AdmissionMetaDataTypeModel;
}

export interface AdmissionMetaDataTypeModel {
  id: string;
  type: string;
  uri: string;
}

export interface ProgressNotesTemplateModel {
  Keyword: string;
  N2Content: string;
  __metadata: AdmissionMetaDataTypeModel;
}

export interface ProgressNotesListModel {
  ActionDate: string;
  ActionTime: string;
  CancelCause: string;
  CancelCauseText: string;
  CancelDate: null;
  CancelUser: string;
  CancelUserName: string;
  Cancelled: boolean;
  CaseId: string;
  Category: string;
  CategoryText: string;
  CreationDate: string;
  CreationTime: string;
  CreationUser: string;
  CreationUserName: string;
  DocumentOu: string;
  DocumentOuName: string;
  EmployeeResp: string;
  EmployeeRespName: string;
  MovementId: string;
  Notekey: string;
  PatientId: string;
  ProfGroup: string;
  ProfGroupName: string;
  Text: string;
  __metadata: AdmissionMetaDataTypeModel;
}
