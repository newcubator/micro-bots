import Parser from "rss-parser";
import { TweetUserTimelineV2Paginator, TweetV2, UserV2 } from "twitter-api-v2";
import { twitterClient } from "../clients/twitter";

const parser = new Parser();

export const handler = async () => {
  try {
    const feed = await fetchRssFeed();
    const tweets = await fetchLatestTweets();
    const betterTweets: TweetV2[] = tweets.map((tweet) => ({ ...tweet, text: unEscape(tweet.text) }));
    const notYetTweeted = tweetedRssGuids(feed, betterTweets);
    const newPost = createNewTweet(notYetTweeted[0]);
    await sendTweet(newPost);
  } catch (ex) {
    console.error(ex);
  }
};

//RssFeed auslesen:
export async function fetchRssFeed(): Promise<RssFeedItem[]> {
  try {
    const feed = await parser.parseURL("https://newcubator.com/devsquad/rss.xml");
    return feed.items as RssFeedItem[];
  } catch (ex) {
    return [];
  }
}

//Twittertimeline abfragen:
export async function fetchLatestTweets(): Promise<TweetV2[]> {
  const user: UserV2 = (await twitterClient.v2.userByUsername("newcubator")).data;
  const newcubatorTweets: TweetUserTimelineV2Paginator = await twitterClient.v2.userTimeline(user.id, {
    exclude: ["replies", "retweets"],
    max_results: 20,
  });
  return newcubatorTweets.tweets;
}

//HTML umwandeln
export function unEscape(htmlStr: string) {
  return htmlStr
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

//Tweet formatieren
export function createNewTweet(feedItem: RssFeedItem) {
  let statusUpdate = `Neues aus dem Entwicklerteam: ${feedItem.title} ${feedItem.link} #devsquad`;
  if (statusUpdate.length > 280) {
    statusUpdate = `Neues aus dem Entwicklerteam: ${feedItem.title.substr(
      0,
      feedItem.title.length - (statusUpdate.length - 277)
    )}... ${feedItem.link} #devsquad`;
    return statusUpdate;
    //sendTweet(statusUpdate);
  } else return statusUpdate;
  //else sendTweet(statusUpdate);
}

//Tweets absenden:
async function sendTweet(message: string) {
  const createdTweet = await twitterClient.v1.tweet(message);
  console.log("Tweet", createdTweet.id_str, ":", createdTweet.full_text);
}

export function tweetedRssGuids(feed: RssFeedItem[], tweets: TweetV2[]) {
  //filter alle
  const tweetedRss = feed
    .filter((feedItems) => tweets.some((tweet) => tweet.text.includes(feedItems.title)))
    //neues Array von allen guids
    .map((feedItems) => feedItems.guid);
  return feed.filter((feedItems) => !tweetedRss.includes(feedItems.guid));
}

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
