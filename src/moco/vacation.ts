import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  getUsersWithStartAndEndDate,
  UsersWithVacations,
} from "../vacation-handover/get-users-with-start-and-end-date";
import { getUsersWithVacationDatesAndEmployment } from "../vacation-handover/get-users-with-vacation-dates-and-employment";
import { getUsers as mocoGetUsers } from "./users";

dayjs.extend(isBetween);
const MIN_VACATION_DURATION = 3;

export async function getUsersWithVacation(): Promise<Array<UsersWithVacations>> {
  const day = dayjs().add(7, "day");

  const mocoUsers = await mocoGetUsers();

  const vacationUsers = await getUsersWithVacationDatesAndEmployment(mocoUsers, day);

  const usersWithStartAndEndDates = getUsersWithStartAndEndDate(vacationUsers, day, MIN_VACATION_DURATION);

  return usersWithStartAndEndDates;
}
