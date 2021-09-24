import Parser from "rss-parser";
import { TweetUserTimelineV2Paginator, TweetV2, TwitterApi, UserV2 } from "twitter-api-v2";

const parser = new Parser();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

export const handler = async () => {
  try {
    const feed = await fetchRssFeed();
    const tweets = await fetchLatestTweets();
    const betterTweets: TweetV2[] = tweets.map((t) => ({ ...t, text: unEscape(t.text) }));
    const tweetedRss = twitteredRssGuids(feed, betterTweets);
    const notYetTwittered = feed.filter((f) => !tweetedRss.includes(f.guid));
    createNewTweet(notYetTwittered[0]);
  } catch (ex) {
    console.error(ex);
  }
};

//RssFeed auslesen:
async function fetchRssFeed(): Promise<RssFeedItem[]> {
  try {
    const feed = await parser.parseURL("https://newcubator.com/devsquad/rss.xml");
    return feed.items as RssFeedItem[];
  } catch (ex) {
    return [];
  }
}

//Twittertimeline abfragen:
async function fetchLatestTweets(): Promise<TweetV2[]> {
  const user: UserV2 = (await twitterClient.v2.userByUsername("newcubator")).data;
  const newcubatorTweets: TweetUserTimelineV2Paginator = await twitterClient.v2.userTimeline(user.id, {
    exclude: ["replies", "retweets"],
    max_results: 20,
  });
  return newcubatorTweets.tweets;
}

//HTML umwandeln
function unEscape(htmlStr: string) {
  htmlStr = htmlStr.replace(/&lt;/g, "<");
  htmlStr = htmlStr.replace(/&gt;/g, ">");
  htmlStr = htmlStr.replace(/&quot;/g, '"');
  htmlStr = htmlStr.replace(/&#39;/g, "'");
  htmlStr = htmlStr.replace(/&amp;/g, "&");
  return htmlStr;
}

//Tweet formatieren
function createNewTweet(feedItem: RssFeedItem) {
  let statusUpdate = `Neues aus dem Entwicklerteam: ${feedItem.title} ${feedItem.link} #devsquad`;
  sendTweet(statusUpdate);
}

//Tweets absenden:
async function sendTweet(message: string) {
  const createdTweet = await twitterClient.v1.tweet(message);
  console.log("Tweet", createdTweet.id_str, ":", createdTweet.full_text);
}

function twitteredRssGuids(feed: RssFeedItem[], tweets: TweetV2[]) {
  //filter alle
  return (
    feed
      .filter((f) => tweets.some((t) => t.text.includes(f.title)))
      //neues Array von allen guids
      .map((f) => f.guid)
  );
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
