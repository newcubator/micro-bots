import { RssFeedItem, Tweet } from "./twitter-bot";

export function filterUntweetedDevSquadPosts(feed: RssFeedItem[], tweets: Tweet[]) {
  return feed.filter((feedItem) => !tweets.some((tweet) => tweet.guid === feedItem.guid));
}
