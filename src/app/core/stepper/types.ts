export interface StepperType {
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
  Lfdnr?: string;
  Lfdbew?: string;
  MovmntSeq?: string;
}
