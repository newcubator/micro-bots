import { AxiosResponse } from "axios";
import dayjs from "dayjs";
import { GitlabIssue } from "../gitlab/gitlab";
import { postIssue } from "../gitlab/issues";
import { MocoEmployment, MocoUserType } from "../moco/types/moco-types";
import { calculateDueDate } from "./calculate-due-date";

export const createIssuesForUsers = (
  users: { user: MocoUserType; dates: string[]; employment: MocoEmployment }[],
  description: string,
  issues: GitlabIssue[]
): Array<Promise<AxiosResponse<GitlabIssue, any> | void>> => {
  return users.map((user) => {
    const issueTitle = `Urlaubsübergabe ${user.user.firstname} (${dayjs(user.dates[0]).format("DD.MM.YYYY")} - ${dayjs(
      user.dates[1]
    ).format("DD.MM.YYYY")})`;
    const dueDate = calculateDueDate(dayjs(user.dates[0]), user.employment).format("YYYY-MM-DD");
    const issue = issues.find((issue) => issue.title === issueTitle);
    if (issue === undefined) {
      return postIssue(process.env.GITLAB_BOOK_PROJECT_ID, issueTitle, description, ["Urlaubsübergabe"], dueDate).then(
        (res) => {
          console.log(
            `New issue for vacation of ${user.user.firstname} for vacation from ${user.dates[0]} to ${user.dates[1]} was created at ${res.data.web_url}. Due date: ${dueDate}`
          );
        }
      );
    } else {
      console.log(
        `Issue for detected vacation of ${user.user.firstname} for vacation from ${user.dates[0]} to ${user.dates[1]} already exists with due date ${dueDate}`
      );
    }
  });
};
