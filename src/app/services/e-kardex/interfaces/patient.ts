import { SafeResourceUrl } from '@angular/platform-browser';

export interface Patient {
  id: number;
  photo?: {
    changingThisBreaksApplicationSecurity: SafeResourceUrl;
  };
  name: string;
  gender: string;
  birthDate: string;
  age: number;
  phone?: string;
  email?: string;
  address?: string;
  periodStart: string;
  encounterStart?: string;
  lenghtOfStay: number;
  location: LocationPatient;
  careManager: string;
  institution?: string;
  case: string;
  financeCat?: string;
  riskfactors?: string;
  allergyInfo?: string;
  height?: VitalSing;
  weight?: VitalSing;
  bmi?: VitalSing;
  bradenScaleScore?: string;
  bradenScaleScoreTxt?: string;
  fallRiskForceScore?: string;
  fallRiskForceScoreTxt?: string;
  deptOrgUnit?: string;
  deptOrgUnitTxt?: string;
  isInPatient?: boolean;
  caseTypeText?: string;
  flagsIcons?: FlagIcons;
  primDiaTxt?: string;
  bloodGrpTxt?: string;
  maritalStatus?: string;
  telephone?: string;
  admissionDate?: string;
  Nationality?:string;
  KinTelephone?:string;
  kinName?:string;
  Treatmentou?:string;
}

export interface FlagIcons {
  packageInd?: FlagStatus;
  isolationInd?: FlagStatus;
  watchListInd?: FlagStatus;
  clinicPharmctStdInd?: FlagStatus;
  patCatInd?: FlagStatus;
  riskFactorInd?: FlagStatus;
}

export interface FlagStatus {
  active: boolean;
  text: string;
}

export interface LocationPatient {
  room: string;
  bed: string;
}

export interface VitalSing {
  id: string;
  value: number;
  unit: string;
  dateTime: string;
}
