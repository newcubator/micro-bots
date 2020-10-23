import {MocoUserType} from "./moco-types";

export interface DayObjectType {
  day: string;
  expectedHours: number;
  worked: number;
  holiday?: boolean;
  weekend?: boolean;
}


export interface WorkloadType {
  user: MocoUserType,
  expectedHours: number,
  holidays: number,
  workedHours: number,
  days: DayObjectType[]
}

