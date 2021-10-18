import dayjs, { BusinessHours } from "dayjs";
import { MocoEmployment } from "../moco/types/moco-types";
import dayjsBusinessTimes from "dayjs-business-time";

dayjs.extend(dayjsBusinessTimes);

export const setUpBusinessTimes = (employment: MocoEmployment) => {
  const businessHours: BusinessHours[] = [
    { start: "08:00:00", end: "12:00:00" },
    { start: "12:00:00", end: "16:00:00" },
  ];
  dayjs.setBusinessTime({
    sunday: null,
    monday: employment.pattern.am[0] + employment.pattern.pm[0] > 0 ? businessHours : null,
    tuesday: employment.pattern.am[1] + employment.pattern.pm[1] > 0 ? businessHours : null,
    wednesday: employment.pattern.am[2] + employment.pattern.pm[2] > 0 ? businessHours : null,
    thursday: employment.pattern.am[3] + employment.pattern.pm[3] > 0 ? businessHours : null,
    friday: employment.pattern.am[4] + employment.pattern.pm[4] > 0 ? businessHours : null,
    saturday: null,
  });
};
