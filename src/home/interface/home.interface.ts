export interface ElderlyHome {
  dname: string;
  imageid: string;
  listModuleid: number[];
}

export interface Elderly {
  uid: number;
  dname: string;
  imageid: string;
}

export interface CaretakerHome {
  dname: string;
  imageid: string;
  listElderly: Elderly[];
}

export interface ModuleInfo {
  moduleid: number;
  mname: string;
}

export interface ElderlyInfo {
  imageid: string;
  fname: string;
  lname: string;
  dname: string;
  gender: string;
  bday: Date;
  healthCondition: string;
  bloodType: string;
  personalMedication: string;
  allergy: string;
  vaccine: string;
  phone: string;
  listModuleid: number[];
}
