import dayjs from "dayjs";
import { getUserEmployments } from "../moco/employments";
import { getUserSchedules } from "../moco/schedules";
import { MocoUserType } from "../moco/types/moco-types";

export const getUsersWithVacationDatesAndEmployment = async (users: MocoUserType[], date: dayjs.Dayjs) => {
  return await Promise.all(
    users.map(async (user) => {
      return {
        user,
        vacationDates: (
          await getUserSchedules(
            date.subtract(28, "day").format("YYYY-MM-DD"),
            date.add(28, "day").format("YYYY-MM-DD"),
            user.id
          )
        ).data
          .filter((schedule) => ["Feiertag", "Urlaub"].includes(schedule.assignment.name))
          .map((e) => e.date)
          .sort((a, b) => a.localeCompare(b)),
        employment: (
          await getUserEmployments(
            date.subtract(28, "day").format("YYYY-MM-DD"),
            date.add(28, "day").format("YYYY-MM-DD"),
            user.id
          )
        ).data.find(
          (employment) => date.isBetween(dayjs(employment.from), dayjs(employment.to)) || employment.to === null
        ),
      };
    })
  );
};
