## About the Twitter Bot

The Twitter bot periodically fetches new blog posts via an RSS feed and also posts it on twitter. It always tweets the title and a link to the corresponding blog post. Currently, it runs every day at 5pm.
To adjust this, you can simply change the execution time of the [AWS EventBridge](https://docs.aws.amazon.com/eventbridge/) [here](https://gitlab.com/newcubator/micro-bots/-/blob/main/serverless.yml).

Right now, the source url is hardcoded. If you wish to change the RSS source, you'll need to adjust it [here](https://gitlab.com/newcubator/micro-bots/-/blob/main/src/twitter-bot/get-dev-squad-posts.ts).

The bot saves published tweets in Google Sheets. The tweets are saved line by line. The issue number is stored in the first column and the title in the second column.

![Twitter Bot](docs/twitter-bot.mp4)

## Prerequisites

- [(free) Twitter Developer Account](https://developer.twitter.com/)
- [(free) Google Account](https://docs.google.com/spreadsheets/u/0/)
- a blank Google Sheet
- website with RSS feed

## How to Use

1. Get the following Twitter developer keys :key:

- TWITTER_ACCESS_SECRET
- TWITTER_ACCESS_TOKEN
- TWITTER_APP_KEY
- TWITTER_APP_SECRET

Add the keys to the environment variables in Gitlab (Settings > CI/CD > Variables).

2. Get the corresponding information for your google sheet:

| Information                 | Value                                         |
| --------------------------- | --------------------------------------------- |
| type                        | your account type                             |
| project_id                  | your project id                               |
| private_key_id              | your private key id                           |
| private_key                 | your private key                              |
| client_email                | the mail adress you use for your google sheet |
| client_id                   | your client id                                |
| auth_uri                    | https://accounts.google.com/o/oauth2/auth     |
| token_uri                   | https://oauth2.googleapis.com/token           |
| auth_provider_x509_cert_url | https://www.googleapis.com/oauth2/v1/certs    |
| client_x509_cert_url        | your personal client url                      |

Then add this information as a secret to **the aws secret manager**.

Also add the concrete sheet id (TWITTER_BOT_SPREADSHEET_ID) to the gitlab variables (Settings > CI/CD > Variables).
You get it here: `https://docs.google.com/spreadsheets/d/TWITTER_BOT_SPREADSHEET_ID/`

3. Get the keys for your AWS secret manager :key:

- AWS_ACCESS_KEY_ID_GOOGLE
- AWS_SECRET_ACCESS_KEY_GOOGLE

Add the key to the environment variables in Gitlab (Settings > CI/CD > Variables).

## Local Development

To start the Twitter bot locally, run the following command:

```
npm run invoke --function=twitterBot
```
