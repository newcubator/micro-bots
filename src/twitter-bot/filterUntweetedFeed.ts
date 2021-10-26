import { TweetV2 } from "twitter-api-v2";
import { RssFeedItem } from "../functions/twitter-bot";
import { shortenFeedTitle } from "./shortenFeedTitle";

export function filterUntweetedFeed(feed: RssFeedItem[], tweets: TweetV2[]) {
  return feed.filter(
    (feedItem) => !tweets.some((tweet) => tweet.text.includes(shortenFeedTitle(feedItem.title, tweet.text.length)))
  );
}
