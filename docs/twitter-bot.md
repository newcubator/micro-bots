## About the Twitter Bot

The Twitter bot periodically fetches new blog posts via an RSS feed and also posts it on twitter. It always tweets the title and a link to the corresponding blog post. Currently, it runs every day at 5pm.
To adjust this, you can simply change the execution time of the [AWS EventBridge](https://docs.aws.amazon.com/eventbridge/) [here](https://gitlab.com/newcubator/micro-bots/-/blob/main/serverless.yml).

Right now, the source url is hardcoded. If you wish to change the RSS source, you'll need to adjust it [here](https://gitlab.com/newcubator/micro-bots/-/blob/main/src/twitter-bot/get-dev-squad-posts.ts).

The bot saves published tweets in Google Sheets. The tweets are saved line by line. The issue number is stored in the first column and the title in the second column.

## Prerequisites

- [(free) Twitter Developer Account](https://developer.twitter.com/)
- [(free) Google Account](https://docs.google.com/spreadsheets/u/0/)
- a blank Google Sheet
- website with RSS feed

## How to Use

1. Get the following Twitter developer keys

- TWITTER_ACCESS_SECRET
- TWITTER_ACCESS_TOKEN
- TWITTER_APP_KEY
- TWITTER_APP_SECRET

Add the keys to the environment variables in Gitlab (Settings > CI/CD > Variables).

2. Get the [Google Sheets accessor key](https://developers.google.com/sheets/api/guides/authorizing#APIKey)

Add the key to the environment variables in Gitlab (Settings > CI/CD > Variables).

## Local Development

To start the Twitter bot locally, run the following command:

```
npm run invoke:twitterBot
```

## Testing

To run the Twitter bot tests, run the following command:

```
npm run test
```

![Twitter Bot](docs/twitter-bot.mp4)
