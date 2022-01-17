## About the Private Channel Bot

The private channel bot opens a Slack channel with everyone except the specified users.
We use this command, for example, to create a channel in which we discuss a joint gift for an employee who will soon have his birthday.

## Prerequisites

- create a [slack app](https://api.slack.com/authentication/basics)
- add the private-channel [Slash Command](https://api.slack.com/interactivity/slash-commands) to your app
- get the SLACK_TOKEN and add the key to the environment variables in Gitlab (Settings > CI/CD > Variables).

## How to Use

To use the private-channel bot, just type /private-channel in any chat.
The expected parameters for the command are a channel name and a list of users. To list the users you should use the @user notation.

General syntax:

```
/private-channel <channelname> @username1 ... @usernameN
```

Example:

```
/private-channel my-private-channel @user1toExclude @user2toExclude
```

![Private-Channel](docs/private-channel.gif)

## Local Development

To start the private channel bot locally, run the following command:

```
npm run invoke --function=privateChannel
```

In this case, the bot creates a channel with all employees.
For this, you would have to additionally store the Slack token in the `local.env`. Ideally, you should use your own test Slack for this.
