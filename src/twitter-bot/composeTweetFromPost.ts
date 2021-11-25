import { shortenFeedTitle } from "./shorten-feed-title";
import { RssFeedItem, Tweet } from "./twitter-bot";

export function composeTweetFromPost(feedItem: RssFeedItem): Tweet {
  let tweetText = tweetTemplate(feedItem.title, feedItem.link);
  if (tweetText.length > 280) {
    tweetText = tweetTemplate(shortenFeedTitle(feedItem.title, tweetText.length), feedItem.link);
  }
  return { guid: feedItem.guid, title: feedItem.title, message: tweetText };
}

export function tweetTemplate(title: string, link: string) {
  return `Neues aus dem Entwicklerteam: ${title} ${link} #devsquad`;
}
