export interface ConsumableList {
  Einri: string;
  Falnr: string;
  Anfoe: string;
  Anpoe: string;
  PatMatCosmpNmm7HdToItmNav: PatMatCosmpNmm7HdToItmNav;
}
export interface PatMatCosmpNmm7HdToItmNav {
  results: Details[];
}
export interface Details {
  Falnr: string;
  Werks: string;
  Matnr: string;
  Menge: string;
  Meins: string;
  Lfdat: string;
  Lfsta: string;
  Genam: string;
  Postx: string;
  Abrkz: string;
  Charg: string;
  Drukz: string;
  Wempf: string;
  Cstock: string;
  Ftxtkz: string;
  Txz01: string;
  PrioUrg: string;
  PrioReq: string;
  Gernr: string;
}

export interface MaterialStockDetails {
  Matnr: string;
  Maktx: string;
  Werks: string;
  Lgort: string;
  Charg: string;
  Uom: string;
  Stock: string;
  Vfdat?: any;
}

export interface MaterialDetails {
  d: DMaterialDetails;
}
export interface DMaterialDetails {
  results: MaterialDetailsResult[];
}
export interface MaterialDetailsResult {
  __metadata: Metadata;
  Matnr: string;
  Maktx: string;
  Maktg: string;
  Meins:string
}

export interface MaterialStockDetails {
  d: DMaterialStockDetails;
}
export interface DMaterialStockDetails {
  results: MaterialStockDetailsResult[];
}
export interface MaterialStockDetailsResult {
  __metadata: Metadata;
  Matnr: string;
  Uom: string;
  Charg: string;
  Vfdat?: any;
  Werks: string;
  Lgort: string;
  Stock: string;
  Maktx: string;
}

export interface Metadata {
  id: string;
  uri: string;
  type: string;
}

export interface ConsumablesHistory {
  d: D
}

export interface D {
  results: ConsumablesHistoryResult[]
}

export interface ConsumablesHistoryResult {
  __metadata: Metadata
  Einri: string
  Falnr: string
  Anfoe: string
  Anpoe: string
  Werks: string
  Matnr: string
  Maktx: string
  Menge: string
  Meins: string
  Lfdat: string
  Sloc: string
  Batch: string
  Erdat: string
  Erusr: string
  NonBillable: string
  CreatedAt?: string
}




export interface PatientWithouConsumables {
  d: List
}

export interface List {
  results: PatientWithouConsumables[]
}

export interface PatientWithouConsumablesDetails {
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
}

export interface Metadata {
  id: string
  uri: string
  type: string
}