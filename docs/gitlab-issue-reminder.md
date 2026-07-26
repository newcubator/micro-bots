## About the Gitlab Issue Reminder

The Gitlab issue reminder checks the specified project each day for issues due today and sends a reminder to the specified Slack channel.

This can look like this, for example:

![Gitlab-Issue-Reminder](gitlab-issue-reminder-image.png)

## Prerequisites

- create a [slack app](https://api.slack.com/authentication/basics)
- get the SLACK_TOKEN
- get your [GITLAB_TOKEN](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)
- add the keys to the environment variables in Gitlab (Settings > CI/CD > Variables).

## How to Use

The Gitlab project id and the Slack channel id are configured through `GITLAB_BOOK_PROJECT_ID` and `GENERAL_CHANNEL`.
The project id is the id of the project for which you want to receive a reminder.
The Slack channel id is the id of the Slack channel where you want to post the reminder.
This can be done by adding the corresponding protected GitLab CI variables.

## How it works

The Gitlab Issue Reminder runs every day at 4:05 AM (UTC). It loads the data from Gitlab, processes it, and uploads it to slack.

The schedule is defined as the `micro-bots-book-issue-reminder` Kubernetes CronJob in [`infrastructure/index.ts`](../infrastructure/index.ts).
