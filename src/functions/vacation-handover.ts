import isBetween from "dayjs/plugin/isBetween";
import dayjs from "dayjs";
import { getIssues, postIssue } from "../gitlab/issues";
import { getUserEmployments } from "../moco/employments";
import { getSchedules, getUserSchedules } from "../moco/schedules";
import { vacationHandoverDescription } from "../vacation-handover/description-template";

dayjs.extend(isBetween);

export const handler = async () => {
  // get scheduled vacations in 7 days
  const day = dayjs().add(7, "day");
  const schedules = await getSchedules(day.format("YYYY-MM-DD"), day.format("YYYY-MM-DD"), 4);

  let usersWithVacationsScheduled = schedules.map((schedule) => schedule.user);
  // get all issues with "Urlaubsübergabe" in the title
  const vacationIssues = (await getIssues(process.env.GITLAB_BOOK_PROJECT_ID, "Urlaubsübergabe", "title")).data;
  // filter users to only have users with no open Urlaubsübergabe issues
  usersWithVacationsScheduled = usersWithVacationsScheduled.filter(
    (user) =>
      !vacationIssues.some(
        (issue) => issue.state === "opened" && issue.title.includes(`${user.firstname} ${user.lastname}`)
      )
  );
  // get users with sorted vacation dates and current employment
  let vacationUsers = await Promise.all(
    usersWithVacationsScheduled.map(async (user) => {
      return {
        user,
        vacationDates: (
          await getUserSchedules(format(day.subtract(28, "day")), format(day.add(28, "day")), user.id, 4)
        ).data
          .map((e) => e.date)
          .sort((a, b) => a.localeCompare(b)),
        employment: (
          await getUserEmployments(format(day.subtract(28, "day")), format(day.add(28, "day")), user.id)
        ).data.find(
          (employment) => day.isBetween(dayjs(employment.from), dayjs(employment.to)) || employment.to == undefined
        ),
      };
    })
  );
  // map vacation users to user with start and end dates of detected vacations
  let usersWithStartAndEndDates = vacationUsers
    .map((value) => {
      let arr: string[][] = [],
        startDate: string = value.vacationDates[0],
        endDate: string;
      for (let i = 0; i < value.vacationDates.length; i++) {
        if (value.vacationDates[i + 1] != undefined) {
          // max difference is calculated by getting non working days in a week + 1 to skip weekends
          if (
            -dayjs(value.vacationDates[i]).diff(value.vacationDates[i + 1], "day") >
            7 - value.employment.weekly_target_hours / 8 + 1
          ) {
            endDate = value.vacationDates[i];
            arr.push([startDate, endDate]);
            startDate = value.vacationDates[i + 1];
          }
        } else {
          endDate = value.vacationDates[i];
          arr.push([startDate, endDate]);
        }
      }
      return {
        user: value.user,
        // only use those sets which are 3 or more days and the day is in between
        dates: arr
          .filter((value) => -dayjs(value[0]).diff(value[1], "day") >= 2)
          .filter((value) => day.isBetween(dayjs(value[0]), dayjs(value[1])))
          .flat(),
      };
    })
    .filter((user) => user.dates.length > 0);

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

const format = (day: dayjs.Dayjs) => day.format("YYYY-MM-DD");
