# newcubator micro bots

This project hosts a collection of our internal bots which are little useful tools which should make our work easier or automate repeating tasks.

## Prerequisites

- [Node.js](https://nodejs.org/en/download), use the version from [`.nvmrc`](./.nvmrc)
- Docker, when you want to run the production container locally

The project runs as a Node.js service and three Kubernetes CronJobs on Hubertus. Pulumi manages the deployment, the Traefik route, CronJobs and application secrets.

## Getting started

To run the bots locally you first have to install all dependencies:

```
npm install
```

Some Microbot functions depend on external services, e.g. Slack or Moco. Please consult the individual documentation (below) for the required setup and further information. Local scripts load environment variables from `.env.local`.

To start the HTTP service locally, use

```
npm run build
npm start
```

The health endpoint is available at `http://localhost:3000/healthz`. Scheduled bots can be run locally through the CLI:

```
npm run build
npm run start:cli -- birthday
npm run start:cli -- book-issue-reminder
npm run start:cli -- vacation-handover
```

## Deployment

GitLab CI builds the container image and deploys it from `main` through Pulumi to Hubertus. The target domain is `microbots.hubertus.newcubator.com`. Required tokens and IDs are set as protected GitLab CI variables and stored as Pulumi secrets in the Kubernetes deployment.

AWS and Serverless deployments are no longer supported. Runtime infrastructure for this service must be changed through the Pulumi Kubernetes stack in [`infrastructure`](./infrastructure).

## Bots :robot:

To get a more detailed description of each bot, click on one of them below :arrow_down:

| Bot                                                      | Description                                          |
| -------------------------------------------------------- | ---------------------------------------------------- |
| [Birthday](./docs/birthday.md)                           | reminds us when its someone's birthday               |
| [Completion Notice](./docs/completionNotice.md)          | facilitates the preparation of a completion notice   |
| [Event Application](./docs/event-application.md)         | automated forwarding of a event application          |
| [Gitlab Issue Reminder](./docs/gitlab-issue-reminder.md) | reminds you of the open issues of a specific project |
| [Mail Signature Bot](./docs/mail-signature.md)           | generates a personalized mail signature              |
| [Private Channel](./docs/private-channel.md)             | opens a private Slack channel                        |
| [Vacation Handover](./docs/vacation-handover.md)         | posts vacation handovers to Slack                    |
| [Short Mail](./docs/shortmail.md)                        | helps you create a short letter faster               |

## Testing

To test our bots we have written unit tests with jest. To run them use this command:

```
npm run test
```
