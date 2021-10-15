import dayjs from "dayjs";
import { getUserEmployments } from "../moco/employments";
import { getUserSchedules } from "../moco/schedules";
import { MocoUserType } from "../moco/types/moco-types";
import { format } from "./create-vacation-handover-issues";

export const getUsersWithVacationDatesAndEmployment = async (users: MocoUserType[], date: dayjs.Dayjs) => {
  return await Promise.all(
    users.map(async (user) => {
      return {
        user,
        vacationDates: (
          await getUserSchedules(format(date.subtract(28, "day")), format(date.add(28, "day")), user.id, 4)
        ).data
          .map((e) => e.date)
          .sort((a, b) => a.localeCompare(b)),
        employment: (
          await getUserEmployments(format(date.subtract(28, "day")), format(date.add(28, "day")), user.id)
        ).data.find(
          (employment) => date.isBetween(dayjs(employment.from), dayjs(employment.to)) || employment.to == undefined
        ),
      };
    })
  );
};
