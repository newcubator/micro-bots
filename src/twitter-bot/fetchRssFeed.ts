//RssFeed auslesen:
import { parser, RssFeedItem } from "../functions/twitter-bot";

export async function fetchRssFeed(): Promise<RssFeedItem[]> {
  try {
    const feed = await parser.parseURL("https://newcubator.com/devsquad/rss.xml");
    return feed.items as RssFeedItem[];
  } catch (ex) {
    return [];
  }
}
