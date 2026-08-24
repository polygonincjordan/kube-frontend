export interface dateHeader {
  date: Date;
  formatedDate: string;
  fulldayFormat: string;
  day: string;
  dayName: string;
  dayMonth: string;
  dayYear: number;
  active: any;
  events?: Events[];
}

export interface Events {
  AnaesthResp: string;
  AnaesthRespNam: string;
  AnaesthType: string;
  AnaesthtechResp: string;
  AnaesthtechRespNam: string;
  AppEndDatetime: Date;
  AppStartDatetime: Date;
  Bauid: string;
  Baukb: string;
  Bauna: string;
  Bauty: string;
  Bkurz: string;
  Einri: string;
  Falnr: string;
  Fromdatetime: Date;
  HospResp: string;
  HospRespNam: string;
  Nname: string;
  Orgid: string;
  OtNo: string;
  Patnamefull: string;
  Patnr: string;
  ScrnursResp: string;
  ScrnursRespNam: string;
  StatusColor: string;
  SurgEndDatetime: string;
  SurgEnded: string;
  SurgLnrls: string;
  SurgResp: string;
  SurgRespNam: string;
  SurgSrvDescr: string;
  SurgStartDatetime: string;
  SurgStarted: string;
  SurgassistResp: string;
  SurgassistRespNam: string;
  Tmnid: string;
  Todatetime: Date;
  Vname: string;
  ZimmrPtloc: string;
  ZimmrPtlocTxt: string;
  Zpbez: string;
  Zpbezdatetime: string;
  Color: string;
}

export interface TimeFormat{
  Time: string;
  ConvertedTime: string;
  Hours: string;
  Minutes: string;
  events?: Events[]
}
