export interface PatientAgeModal {
  AgeFrom: string;
  AgeTo: string;
  Description: string;
  Uom: string;
  __metadata: AdmissionMetaDataTypeModel;
}

export interface AssignUserModal {
  Gpart: string;
  NamString: string;
  isSelected: boolean;
  __metadata: AdmissionMetaDataTypeModel;
}

export interface DiagnosisModal {
  Dkat: string;
  Dkey: string;
  Dtext1: string;
  Favorite: boolean;
  __metadata: AdmissionMetaDataTypeModel;
}

export interface DefaultValueModal {
  value: string;
  label: string;
}

export interface AdmissionMetaDataTypeModel {
  id: string;
  type: string;
  uri: string;
}
