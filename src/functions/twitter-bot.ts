import { createNewTweet } from "../twitter-bot/createNewTweet";
import { fetchTweetsFromSpreadsheet } from "../twitter-bot/fetch-tweets-from-spreadsheet";
import { fetchRssFeed } from "../twitter-bot/fetch-rss-feed";
import { filterUntweetedFeed } from "../twitter-bot/filter-untweeted-feed";
import { saveToSpreadsheet } from "../twitter-bot/save-to-spreadsheet";
import { sendTweet } from "../twitter-bot/send-tweet";
import { setUpSheetsAccessor } from "../twitter-bot/set-up-sheets-accessor";

export const handler = async () => {
  try {
    const googleSheetsAccessor = await setUpSheetsAccessor();
    const feed = await fetchRssFeed();
    const tweets = await fetchTweetsFromSpreadsheet(googleSheetsAccessor);
    const notYetTweeted = filterUntweetedFeed(feed, tweets);
    const newTweet = createNewTweet(notYetTweeted[0]);
    sendTweet(newTweet.message)
      .then(async () => await saveToSpreadsheet(googleSheetsAccessor, newTweet))
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    console.error(err);
  }
};
