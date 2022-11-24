import dayjs from "dayjs";
import { GitlabIssue } from "../gitlab/gitlab";
import { createIssue } from "../gitlab/issues";
import { MocoEmployment, MocoUserType } from "../moco/types/moco-types";
import { calculateDueDate } from "./calculate-due-date";

export const createIssuesForUsers = (
  users: { user: MocoUserType; dates: string[]; employment: MocoEmployment }[],
  description: string,
  issues: GitlabIssue[]
): Array<Promise<GitlabIssue | void>> => {
  return users.map((user) => {
    const issueTitle = `Urlaubsübergabe ${user.user.firstname} (${dayjs(user.dates[0]).format("DD.MM.YYYY")} - ${dayjs(
      user.dates[1]
    ).format("DD.MM.YYYY")})`;
    const dueDate = calculateDueDate(dayjs(user.dates[0]), user.employment).format("YYYY-MM-DD");
    const issue = issues.find((issue) => issue.title === issueTitle);
    if (issue === undefined) {
      return createIssue(
        process.env.GITLAB_BOOK_PROJECT_ID,
        issueTitle,
        description,
        ["VacationHandover"],
        dueDate
      ).then((res) => {
        console.log(
          `New issue for vacation of ${user.user.firstname} for vacation from ${user.dates[0]} to ${user.dates[1]} was created at ${res.web_url}. Due date: ${dueDate}`
        );
      });
    } else {
      console.log(
        `Issue for detected vacation of ${user.user.firstname} for vacation from ${user.dates[0]} to ${user.dates[1]} already exists with due date ${dueDate}`
      );
    }
  });
};
