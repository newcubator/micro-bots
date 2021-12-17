import { getIssues } from "../gitlab/issues";
import { createVacationHandoverIssues } from "../vacation-handover/create-vacation-handover-issues";

export const handler = async () => {
  // get all issues with "Urlaubsübergabe" in the title
  const vacationIssues = (
    await getIssues(process.env.GITLAB_BOOK_PROJECT_ID, { search: "Urlaubsübergabe", in: "title" })
  ).data;

  await Promise.all([createVacationHandoverIssues(vacationIssues)]);
};
