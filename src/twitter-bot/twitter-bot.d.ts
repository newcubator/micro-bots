export interface Tweet {
  guid: string;
  title: string;
  message?: string;
}

export interface RssFeedItem {
  title: string;
  link: string;
  pubDate: string;
  "content:encoded": string;
  guid: string;
}
