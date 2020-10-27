# Birthday Bot

This project includes two different Slack bots.  
A "Birthday Bot" which creates new private channels in Slack whenever an employees birthday is 2 weeks ahead. The other bot is for calculating the workload of employees with data requested from moco.

## Getting started

To run the bot locally you first have to install all dependecies 
```
$ npm install
```

To then invoke the function locally you have to use
```
$ severless invoke local  
```

For more information on that visit [serverless invoke local](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/)

## Deployment

For deployment use
 
```
$ serverless deploy
```