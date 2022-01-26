import { shortenFeedTitle } from "./shorten-feed-title";
import { RssFeedItem, Tweet } from "./twitter-bot";

export function composeTweetFromPost(feedItem: RssFeedItem): Tweet {
  let creator = creatorTemplate(feedItem.creator);
  let tweetText = tweetTemplate(feedItem.title, feedItem.link, creator);
  if (tweetText.length > 280) {
    tweetText = tweetTemplate(shortenFeedTitle(feedItem.title, tweetText.length), feedItem.link, creator);
  }
  return { guid: feedItem.guid, title: feedItem.title, message: tweetText };
}

export function tweetTemplate(title: string, link: string, creator: string) {
  if (creator != "newcubator") {
    return `Neues von @${creator}: ${title} ${link} #devsquad`;
  } else {
    return `Neues aus dem Entwicklerteam: ${title} ${link} #devsquad`;
  }
}

export function creatorTemplate(creator: String) {
  if (creator == undefined) {
    return "newcubator";
  } else {
    return creator.substr(20, creator.length);
  }
}
