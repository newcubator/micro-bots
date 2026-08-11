import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { slackConversationsHistory } from "../slack/slack";
import { getSchedules } from "../moco/schedules";
import { createMessagesForUsers } from "./create-messages-for-users";
import { getUsersWithStartAndEndDate } from "./get-users-with-start-and-end-date";
import { getUsersWithVacationDatesAndEmployment } from "./get-users-with-vacation-dates-and-employment";

const MIN_VACATION_DURATION = 3;

dayjs.extend(isBetween);

export const createVacationHandoverMessages = async (channelId: string) => {
  const day = dayjs().add(7, "day");
  const dayFormatted = day.format("YYYY-MM-DD");

  const [schedules, existingMessages] = await Promise.all([
    getSchedules(dayFormatted, dayFormatted),
    slackConversationsHistory(channelId),
  ]);

  const vacationSchedules = schedules.filter((schedule) => ["Feiertag", "Urlaub"].includes(schedule.assignment.name));
  const usersWithVacationsScheduled = vacationSchedules
    .filter(
      (schedule, index, schedulesForDay) =>
        schedulesForDay.findIndex((candidate) => candidate.user.id === schedule.user.id) === index,
    )
    .map((schedule) => schedule.user);

  const vacationUsers = await getUsersWithVacationDatesAndEmployment(usersWithVacationsScheduled, day);
  const usersWithStartAndEndDates = getUsersWithStartAndEndDate(vacationUsers, day, MIN_VACATION_DURATION);

  await createMessagesForUsers(channelId, usersWithStartAndEndDates, existingMessages);
};
