import { shortenFeedTitle } from "./shorten-feed-title";
import { RssFeedItem, Tweet } from "./twitter-bot";

export function createNewTweet(feedItem: RssFeedItem): Tweet {
  let tweetText = `Neues aus dem Entwicklerteam: ${feedItem.title} ${feedItem.link} #devsquad`;
  if (tweetText.length > 280) {
    tweetText = `Neues aus dem Entwicklerteam: ${shortenFeedTitle(feedItem.title, tweetText.length)}... ${
      feedItem.link
    } #devsquad`;
  }
  return { guid: feedItem.guid, title: feedItem.title, message: tweetText };
}
