import { GoogleSheetsAccessor } from "../clients/google-sheets-accessor";
import { Tweet } from "./twitter-bot";

export async function saveTweetedPost(accessor: GoogleSheetsAccessor, tweet: Tweet): Promise<any> {
  return accessor.addRows(process.env.TWITTER_BOT_SPREADSHEET_ID, "Sheet1!A:B", [[tweet.guid], [tweet.title]]);
}
