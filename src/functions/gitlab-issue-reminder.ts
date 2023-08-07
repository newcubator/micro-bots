import dayjs from "dayjs";
import { slackClient } from "../clients/slack";
import { getIssues } from "../gitlab/issues";

export const handler = async () => {
  if (typeof process.env.GITLAB_PROJECT_ID === "undefined") {
    throw new Error("No GitLab Project ID given to search for due issues in!");
  }
  if (typeof process.env.SLACK_CHANNEL_ID === "undefined") {
    throw new Error("No Slack Channel given to post the message in!");
  }

  const issues = await getOpenIssuesDueToday();
  console.log(`Found ${issues.length} issues due today`);

  await Promise.all(
    issues.map((issue) => postSlackMessage(`⚠️ Das Ticket <${issue.web_url}|${issue.title}> ist heute fällig!`)),
  ).catch((error) => {
    console.error(error);
  });
};

async function getOpenIssuesDueToday() {
  const today = dayjs().format("YYYY-MM-DD");
  console.log(`Searching for open issues due '${today}'`);

  const issues = await getIssues(process.env.GITLAB_PROJECT_ID, { due_date: "week", state: "opened" });

  // API can only filter by due this week so we additionally filter by day
  return issues.data.filter((issue) => issue.due_date === today);
}

async function postSlackMessage(message: string) {
  console.log(`Posting '${message}'`);
  return slackClient.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID,
    text: message,
  });
}
