import Parser from "rss-parser";
import { TweetUserTimelineV2Paginator, TweetV2, UserV2 } from "twitter-api-v2";
import { twitterClient } from "../clients/twitter";

export const parser = new Parser();

export const handler = async () => {
  try {
    const feed = await fetchRssFeed();
    const tweets = await fetchLatestTweets();
    const betterTweets: TweetV2[] = tweets.map((tweet) => ({ ...tweet, text: unEscape(tweet.text) }));
    const notYetTweeted = filterUntweetedFeed(feed, betterTweets);
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
    max_results: 30,
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
  let tweetText = `Neues aus dem Entwicklerteam: ${feedItem.title} ${feedItem.link} #devsquad`;
  if (tweetText.length > 280) {
    tweetText = `Neues aus dem Entwicklerteam: ${shortenFeedTitle(feedItem.title, tweetText.length)}... ${
      feedItem.link
    } #devsquad`;
  }
  return tweetText;
}

//Tweets absenden:
export async function sendTweet(message: string) {
  const createdTweet = await twitterClient.v1.tweet(message);
  console.log("Tweet", createdTweet.id_str, ":", createdTweet.full_text);
}

export function filterUntweetedFeed(feed: RssFeedItem[], tweets: TweetV2[]) {
  return feed.filter(
    (feedItem) => !tweets.some((tweet) => tweet.text.includes(shortenFeedTitle(feedItem.title, tweet.text.length)))
  );
}

function shortenFeedTitle(title: string, tweetTextLength: number): string {
  return title.substr(0, title.length - (tweetTextLength - 277));
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
