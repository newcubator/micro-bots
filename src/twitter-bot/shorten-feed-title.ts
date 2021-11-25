export function shortenFeedTitle(title: string, tweetTextLength: number): string {
  return title.substr(0, title.length - (tweetTextLength - 277)) + "..."; //shorten message to maximum chars of 280 (max tweet length)
}
