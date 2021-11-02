import { createNewTweet } from "../twitter-bot/createNewTweet";
import { fetchTweetsFromSpreadsheet } from "../twitter-bot/fetch-tweets-from-spreadsheet";
import { fetchRssFeed } from "../twitter-bot/fetchRssFeed";
import { filterUntweetedFeed } from "../twitter-bot/filterUntweetedFeed";
import { saveToSpreadsheet } from "../twitter-bot/saveToSpreadsheet";
import { sendTweet } from "../twitter-bot/sendTweet";
import { setUpSheetsAccessor } from "../twitter-bot/set-up-sheets-accessor";

export const handler = async () => {
  try {
    const googleSheetsAccessor = await setUpSheetsAccessor();
    const feed = await fetchRssFeed();
    const tweets = await fetchTweetsFromSpreadsheet(googleSheetsAccessor);
    console.log(tweets);
    const notYetTweeted = filterUntweetedFeed(feed, tweets);
    const newTweet = createNewTweet(notYetTweeted[0]);
    await saveToSpreadsheet(googleSheetsAccessor, newTweet);
    await sendTweet(newTweet.message);
  } catch (err) {
    console.error(err);
  }
};
