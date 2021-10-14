import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { getToday } from '../_shared/getToday';
import { GitlabIssue } from '../gitlab/gitlab';
import { postIssue } from '../gitlab/issues';
import { getIssueTemplateByName } from '../gitlab/templates';
import { getSchedules } from '../moco/schedules';
import { filterUsersWithoutOpenVacationHandoverIssues } from './filter-users-without-open-vacation-handover-issues';
import { getUsersWithStartAndEndDate } from './get-users-with-start-and-end-date';
import { getUsersWithVacationDatesAndEmployment } from './get-users-with-vacation-dates-and-employment';

const MIN_VACATION_DURATION = 3;

dayjs.extend(isBetween);

export const createVacationHandoverIssues = async (vacationIssues: GitlabIssue[]) => {
  // get scheduled vacations in 7 days
  const day = dayjs(getToday()).add(7, "day");
  const schedules = await getSchedules(day.format("YYYY-MM-DD"), day.format("YYYY-MM-DD"), 4);

  // filter users to only have users with no open Urlaubsübergabe issues
  let usersWithVacationsScheduled = filterUsersWithoutOpenVacationHandoverIssues(schedules, vacationIssues);
  // get users with sorted vacation dates and current employment
  let vacationUsers = await getUsersWithVacationDatesAndEmployment(usersWithVacationsScheduled, day);
  // map vacation users to user with start and end dates of detected vacations
  let usersWithStartAndEndDates = getUsersWithStartAndEndDate(vacationUsers, day, MIN_VACATION_DURATION);
  //
  const vacationHandoverDescription = (
    await getIssueTemplateByName(process.env.GITLAB_BOOK_PROJECT_ID, "Urlaubsuebergabe")
  ).data.content;
  // open new issues if no closed issues were found with the expected title
  await Promise.all(
    usersWithStartAndEndDates.map((user) => {
      let issueTitle = `Urlaubsübergabe ${user.user.firstname} (${dayjs(user.dates[0]).format("DD.MM.YYYY")} - ${dayjs(
        user.dates[1]
      ).format("DD.MM.YYYY")})`;
      let issue = vacationIssues.find((issue) => issue.title == issueTitle);
      if (issue == undefined) {
        return postIssue(
          process.env.GITLAB_BOOK_PROJECT_ID,
          issueTitle,
          vacationHandoverDescription,
          ["Urlaubsübergabe"],
          user.dates[0]
        ).then((res) => {
          console.log(
            `New issue for vacation of ${user.user.firstname} for vacation from ${user.dates[0]} to ${user.dates[1]} was created at ${res.data.web_url}`
          );
        });
      } else {
        console.log(
          `Issue for detected vacation of ${user.user.firstname} for vacation from ${user.dates[0]} to ${user.dates[1]} already exists`
        );
      }
    })
  );
};

export const format = (day: dayjs.Dayjs) => day.format("YYYY-MM-DD");
