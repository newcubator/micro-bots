import { MocoUserType } from "./moco-types";

export interface DayObjectType {
  day: string;
  expectedHours: number;
  worked: number;
  holiday?: boolean;
  weekend?: boolean;
  notPlanned?: boolean;
}

export interface WorkloadType {
  user: MocoUserType;
  expectedHours: number;
  holidays: number;
  workedHours: number;
  notPlanned: number;
  absence: number;
  sick: number;
  vacations: number;
  percentage: number;
  days: DayObjectType[];
}
