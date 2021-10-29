import Parser from "rss-parser";
import { TweetV2 } from "twitter-api-v2";
import { AwsSecretsManager } from "../clients/aws-secrets-manager";
import { GoogleSheetsAccessor } from "../clients/google-sheets-accessor";
import { createNewTweet } from "../twitter-bot/createNewTweet";
import { fetchLatestTweets } from "../twitter-bot/fetchLatestTweets";
import { fetchRssFeed } from "../twitter-bot/fetchRssFeed";
import { filterUntweetedFeed } from "../twitter-bot/filterUntweetedFeed";
import { sendTweet } from "../twitter-bot/sendTweet";
import { unEscape } from "../twitter-bot/unEscape";

export const parser = new Parser();

export const handler = async () => {
  try {
    const feed = await fetchRssFeed();
    console.log(feed);
    const tweets = await fetchLatestTweets();
    const betterTweets: TweetV2[] = tweets.map((tweet) => ({ ...tweet, text: unEscape(tweet.text) }));
    const notYetTweeted = filterUntweetedFeed(feed, betterTweets);
    const newPost = createNewTweet(notYetTweeted[0]);
    await sendTweet(newPost);
  } catch (ex) {
    console.error(ex);
  }
};

export interface RssFeedItem {
  creator: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
}
