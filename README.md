# newcubator micro bots

This project hosts a collection of our internal bots which are little useful tools which should make our work easier or automate repeating tasks.

## Prerequisites

- [Node.js](https://nodejs.org/en/download), we use Node.js 14
- [Serverless Framework](https://www.serverless.com)
- [AWS Account](https://aws.amazon.com/)

The project uses the Serverless Framework to create lambda functions (serverless functions) on AWS.

Please read the [documentation guide for Serverless with AWS](https://www.serverless.com/framework/docs/providers/aws/guide/credentials) and make sure that you have completed the necessary steps.

Add the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to the environment variables in Gitlab (Settings > CI/CD > Variables).

## Getting started

To run the bots locally you first have to install all dependencies

```
$ npm install
```

Some Microbot functions depend on external services, e.g. Slack or Moco. Please consult the individual documentation (below) for the required setup and further information.

To then invoke the function locally you have to use

```
npm run invoke --function=<function-name>
```

If you want to invoke your function with a payload create a json file in the payloads directory and invoke your function with

```
npm run invoke --function=<function-name> -- -p ./payloads/<your-json-file.json>
```

For more information on that
visit [serverless invoke local](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/)

## Deployment

For deployment use

```
$ serverless deploy
```

If you want to get more information about the deployment click [here](https://www.serverless.com/framework/docs/providers/aws/guide/deploying).

## Bots :robot:

To get a more detailed description of each bot, click on one of them below :arrow_down:

| Bot                                                      | Description                                          |
| -------------------------------------------------------- | ---------------------------------------------------- |
| [Birthday](./docs/birthday.md)                           | reminds us when its someone's birthday               |
| [Completion Notice](./docs/completionNotice.md)          | facilitates the preparation of a completion notice   |
| [Contact request](./docs/contact-request.md)             | automated forwarding of a contact request            |
| [Event Application](./docs/event-application.md)         | automated forwarding of a event application          |
| [Gitlab Issue Reminder](./docs/gitlab-issue-reminder.md) | reminds you of the open issues of a specific project |
| [Mail Signature Bot](./docs/mail-signature.md)           | generates a personalized mail signature              |
| [Private Channel](./docs/private-channel.md)             | opens a private Slack channel                        |
| [Vacation Handover](./docs/vacation-handover.md)         | opens Gitlab issues for oncoming vacations           |
| [Workload](./docs/workload.md)                           | returns information about the employees workload     |
| [Lock Project](./docs/lock-project.md)                   | locks a moco project                                 |
| [Short Mail](./docs/shortmail.md)                        | helps you create a short letter faster               |

## Testing

To test our bots we have written unit tests with jest. To run them use this command:

```
npm run test
```
