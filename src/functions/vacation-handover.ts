import { getIssues } from "../gitlab/issues";
import { createVacationHandoverIssues } from "../vacation-handover/create-vacation-handover-issues";

export const handler = async () => {
  const gitlabBookProjectId = process.env.GITLAB_BOOK_PROJECT_ID;

  if (typeof gitlabBookProjectId === "undefined") {
    throw new Error("No GitLab book project ID given!");
  }

  // get all issues with "Urlaubsübergabe" in the title
  const vacationIssues = (await getIssues(gitlabBookProjectId, { search: "Urlaubsübergabe", in: "title" })).data;

  await Promise.all([createVacationHandoverIssues(vacationIssues)]);
};
