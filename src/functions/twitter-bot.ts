import { GoogleSheetsAccessor } from "../clients/google-sheets-accessor";
import { createNewTweet } from "../twitter-bot/createNewTweet";
import { fetchTweetsFromSpreadsheet } from "../twitter-bot/fetch-tweets-from-spreadsheet";
import { fetchRssFeed } from "../twitter-bot/fetchRssFeed";
import { filterUntweetedFeed } from "../twitter-bot/filterUntweetedFeed";
import { sendTweet } from "../twitter-bot/sendTweet";
import { setUpSheetsAccessor } from "../twitter-bot/set-up-sheets-accessor";
import { Tweet } from "../twitter-bot/twitter-bot";

export const handler = async () => {
  try {
    const googleSheetsAccessor = await setUpSheetsAccessor();
    const feed = await fetchRssFeed();
    const tweets = await fetchTweetsFromSpreadsheet(googleSheetsAccessor);
    const notYetTweeted = filterUntweetedFeed(feed, tweets);
    const newTweet = createNewTweet(notYetTweeted[0]);
    await sendTweet(newTweet.message);
  } catch (err) {
    console.error(err);
  }
};

async function saveToSpreadsheet(accessor: GoogleSheetsAccessor, tweet: Tweet) {

}
