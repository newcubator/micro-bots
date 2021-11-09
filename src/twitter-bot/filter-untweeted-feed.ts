import { RssFeedItem, Tweet } from "./twitter-bot";

export function filterUntweetedFeed(feed: RssFeedItem[], tweets: Tweet[]) {
  return feed.filter((feedItem) => !tweets.some((tweet) => tweet.guid === feedItem.guid));
}
