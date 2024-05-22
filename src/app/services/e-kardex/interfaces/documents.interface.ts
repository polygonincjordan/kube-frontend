export interface GlasgowComaScaleType {
  id: number;
  keyId: string;
  text: string;
  value: string;
  isDisable: boolean
}


export interface FacePaingScaleType {
  id: number;
  keyId: string;
  text: string;
  value: string;
  image: string;
  isDisable: boolean
}

export interface BradenScaleType {
  id: number;
  keyId: string;
  text: string;
  value: string;
  isDisable: boolean
}

export interface commonKeyValuePair {
  value: string,
  label: string,
  image?: string
}

export interface commonKeyValuePariExt0 {
  Habitid: string,
  value: string
  label: string
  Status: string
  Quantity: string
  Duration: string
  Year: string
  DateFrom: string
}


export interface commonKeyValuePariExt1 {
  value?: string,
  text?: string,
  label?: string,
  TriagePriorityCode?: string,
  TriageColor?: string
  isActive?: boolean
}


export interface commonKeyValuePariExt2 {
  value?: string,
  label?: string,
  TriagePriorityCode?: string,
  TriageColor?: string,
  backgroundColor: string,
  borderColor: string,
  fontColor: string
}


export interface commonKeyValuePariExt3 {
  value?: string,
  ScaleType?: string,
  LastScore?: string,
  description: string,
  Datetimee: string,
  Dockey: string
}


export interface commonKeyValuePariExt4 {
  id?: string,
  value?: string,
  label?: string,
  controlname?: string,
}



