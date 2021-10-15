import dayjs from "dayjs";
import { MocoEmployment, MocoUserType } from "../moco/types/moco-types";

interface UserWithDates {
  user: MocoUserType;
  vacationDates: string[];
  employment?: MocoEmployment;
}

export const getUsersWithStartAndEndDate = (
  users: UserWithDates[],
  date: dayjs.Dayjs,
  MIN_VACATION_DURATION: number
): { dates: string[]; user: MocoUserType }[] => {
  return users
    .map((value) => {
      let arr: string[][] = [],
        startDate: string = value.vacationDates[0],
        endDate: string;
      for (let i = 0; i < value.vacationDates.length; i++) {
        if (value.vacationDates[i + 1] != undefined) {
          // max difference is calculated by getting non working days in a week + 1 to skip weekends
          if (
            -dayjs(value.vacationDates[i]).diff(value.vacationDates[i + 1], "day") >
            7 - value.employment.weekly_target_hours / 8 + 1
          ) {
            endDate = value.vacationDates[i];
            arr.push([startDate, endDate]);
            startDate = value.vacationDates[i + 1];
          }
        } else {
          endDate = value.vacationDates[i];
          arr.push([startDate, endDate]);
        }
      }
      return {
        user: value.user,
        // only use those sets which are MIN_VACATION_DURATION or more days and the day is in between start and end date
        dates: arr
          .filter((value) => -dayjs(value[0]).diff(value[1], "day") >= MIN_VACATION_DURATION - 1)
          .filter((value) => date.isBetween(dayjs(value[0]), dayjs(value[1])))
          .flat(),
      };
    })
    .filter((user) => user.dates.length > 0);
};
