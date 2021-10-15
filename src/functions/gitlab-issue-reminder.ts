import dayjs from "dayjs";
import { slackClient } from "../clients/slack";
import { getIssues } from "../gitlab/issues";
import { getProject } from "../gitlab/projects";
import { slackChatPostMessage } from "../slack/slack";

const GITLAB_PROJECT = process.env.GITLAB_PROJECT;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || process.env.GENERAL_CHANNEL;

export const handler = async () => {
  if (!GITLAB_PROJECT) {
    throw new Error("No gitlab Project was provided. Please provide a project id in the environment variables.");
  }

  const project = (await getProject(GITLAB_PROJECT)).data;

  const issues = (await getIssues(GITLAB_PROJECT)).data;

  const today = dayjs();

  const dueIssues = issues.filter((issue) => issue.due_date == today.format("YYYY-MM-DD"));

  if (dueIssues.length == 0) {
    console.log(`No due issues were found for ${today.format("YYYY-MM-DD")}`);
    return;
  }

  await Promise.all(
    dueIssues.map((issue) => {
      return slackClient.chat.postMessage({
        text: `Das Issue '${issue.title}' aus dem Projekt '${project.name}' ist heute fällig!`,
        channel: SLACK_CHANNEL,
        username: "Micro Bots",
      });
    })
  );
};
