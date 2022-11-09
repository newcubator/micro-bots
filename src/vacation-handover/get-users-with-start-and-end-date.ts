import dayjs from "dayjs";
import dayjsBusinessTimes from "dayjs-business-time";
import { MocoEmployment, MocoUserType } from "../moco/types/moco-types";
import { setUpBusinessTimes } from "./set-up-business-times";

dayjs.extend(dayjsBusinessTimes);

interface UserWithDates {
  user: MocoUserType;
  vacationDates: string[];
  employment: MocoEmployment;
}
export interface UsersWithVacations {
  user: MocoUserType;
  dates: string[];
  employment: MocoEmployment;
}

export const getUsersWithStartAndEndDate = (
  users: UserWithDates[],
  date: dayjs.Dayjs,
  MIN_VACATION_DURATION: number
): UsersWithVacations[] => {
  return users
    .map((value) => {
      setUpBusinessTimes(value.employment);

      const arr: string[][] = [];
      let startDate: string = value.vacationDates[0];
      let endDate: string;

      for (let i = 0; i < value.vacationDates.length; i++) {
        if (value.vacationDates[i + 1] !== undefined) {
          if (!value.vacationDates.includes(dayjs(value.vacationDates[i]).nextBusinessDay().format("YYYY-MM-DD"))) {
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
        employment: value.employment,
      };
    })
    .filter((user) => user.dates.length > 0);
};
