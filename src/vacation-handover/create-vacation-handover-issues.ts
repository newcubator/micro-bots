import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { GitlabIssue } from "../gitlab/gitlab";
import { getIssueTemplateByName } from "../gitlab/templates";
import { getSchedules } from "../moco/schedules";
import { createIssuesForUsers } from "./create-issues-for-users";
import { filterUsersWithoutOpenVacationHandoverIssues } from "./filter-users-without-open-vacation-handover-issues";
import { getUsersWithStartAndEndDate } from "./get-users-with-start-and-end-date";
import { getUsersWithVacationDatesAndEmployment } from "./get-users-with-vacation-dates-and-employment";

const MIN_VACATION_DURATION = 3;

dayjs.extend(isBetween);

export const createVacationHandoverIssues = async (vacationIssues: GitlabIssue[]) => {
  // get scheduled vacations in 7 days
  const day = dayjs().add(7, "day");
  const dayFormatted = day.format("YYYY-MM-DD");

  const schedules = (await getSchedules(dayFormatted, dayFormatted)).filter((schedule) =>
    ["Feiertag", "Urlaub"].includes(schedule.assignment.name),
  );

  const usersWithVacationsScheduled = filterUsersWithoutOpenVacationHandoverIssues(schedules, vacationIssues);

  const vacationUsers = await getUsersWithVacationDatesAndEmployment(usersWithVacationsScheduled, day);

  const usersWithStartAndEndDates = getUsersWithStartAndEndDate(vacationUsers, day, MIN_VACATION_DURATION);

  const vacationHandoverDescription = (
    await getIssueTemplateByName(process.env.GITLAB_BOOK_PROJECT_ID, "Urlaubsübergabe")
  ).content;

  // open new issues if no closed issues were found with the expected title
  await Promise.all(createIssuesForUsers(usersWithStartAndEndDates, vacationHandoverDescription, vacationIssues));
};
