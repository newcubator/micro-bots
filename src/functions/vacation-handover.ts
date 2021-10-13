import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { getIssues } from "../gitlab/issues";
import { createVacationHandoverIssues } from "../vacation-handover/create-vacation-handover-issues";
import { createVacationHandoverReminder } from "../vacation-handover/create-vacation-handover-reminder";

dayjs.extend(isBetween);

export const handler = async () => {
  // get all issues with "Urlaubsübergabe" in the title
  const vacationIssues = (await getIssues(process.env.GITLAB_BOOK_PROJECT_ID, "Urlaubsübergabe", "title")).data;

  await Promise.all([createVacationHandoverIssues(vacationIssues), createVacationHandoverReminder(vacationIssues)]);
};
