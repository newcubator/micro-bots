# newcubator micro bots

This project hosts a collection of our internal bots which are little useful tools which should make our work easier or automate repeating tasks.

## Getting started

To run the bots locally you first have to install all dependencies
```
$ npm install
```

To then invoke the function locally you have to use
```
$ severless invoke local
```

Basic invoke commands are available in the package.json.

If you want to invoke your function with a payload create a json file in the payloads directory and invoke your function with
```
$ severless invoke local -f <your-function> -p ./payloads/<your-json-file.json>
```

For more information on that
visit [serverless invoke local](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/)

## Deployment

For deployment use
```
$ serverless deploy
```

## Bots

### Birthday Bot

This bot opens a slack channel a few weeks before an employee's birthday with all other newcubator employees. This way we do not forget
birthdays and have enough time to think about presents. The bot also reminds us on the birthday to congratulate the birthday child and
archives the channel on the following workday.

### Workload Bots

The workload bots are used to gain an overview over the employees tracked times for customer projects. newcubator employees should work a
certain percentage of their time for a customer.

#### workload
Can only be triggered by a slack command and returns information about your own workload.

#### workload-all

Is automatically triggered at the end of the week posting an overview over the workload to a slack channel. The environment variable "
EMPLOYEE_NAMES" holds a list of all employees which work for customer projects.

### Mail Signature Bot

This bot can be invoked from Slack returning you a personalized mail signature that you can use in your mails.
