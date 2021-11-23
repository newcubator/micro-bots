import Parser from "rss-parser";
import { RssFeedItem } from "./twitter-bot";
export const parser = new Parser();

export async function getDevSquadPosts(): Promise<RssFeedItem[]> {
  try {
    const feed = await parser.parseURL("https://newcubator.com/devsquad/rss.xml");
    return feed.items as RssFeedItem[];
  } catch (ex) {
    return [];
  }
}
