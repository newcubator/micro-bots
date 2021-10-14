import dayjs from 'dayjs';
import { getToday } from '../_shared/getToday';
import { GitlabIssue } from '../gitlab/gitlab';
import { slackChatPostMessage } from '../slack/slack';

export const createVacationHandoverReminder = async (vacationIssues: GitlabIssue[]) => {
  const tomorrow = dayjs(getToday()).add(1, "day");

  const dueVacationIssues = vacationIssues.filter((issue) => issue.due_date == tomorrow.format("YYYY-MM-DD"));

  if (dueVacationIssues.length == 0) {
    console.log(`No due vacation handover issues were found for ${tomorrow.format("YYYY-MM-DD")}`);
    return;
  }

  await Promise.all(
    dueVacationIssues.map((issue) => {
      const name = issue.title.replace("Urlaubsübergabe", "").trim().split(" ").shift().trim();
      const startEndDates = issue.title.match(/\d{2}\.\d{2}\.\d{4}/g);
      if (startEndDates.length == 2) {
        return slackChatPostMessage(
          `Hallo zusammen, morgen geht ${name} vom ${startEndDates.shift()} bis zum ${startEndDates.shift()} in den Urlaub. Prüft nochmal nach, ob alles übergeben wurde!`,
          process.env.GENERAL_CHANNEL,
          "Micro Bots"
        );
      } else {
        console.error("Issue title doesn't have two dates");
      }
    })
  );
};
