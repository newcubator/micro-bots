# Gitlab Issue Reminder

The Gitlab issue reminder checks the specified project each day for issues due today and sends a reminder to the specified Slack channel.

The Gitlab project id and the Slack channel id have to be specified as environment variables at GITLAB_PROJECT and SLACK_CHANNEL. This can be done in the serverless.yaml for each function so that there can be more than one reminder active at a time
