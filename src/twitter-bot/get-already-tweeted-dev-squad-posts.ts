import { GoogleSheetsAccessor } from "../clients/google-sheets-accessor";
import { Tweet } from "./twitter-bot";

export async function getAlreadyTweetedDevSquadPosts(accessor: GoogleSheetsAccessor): Promise<Tweet[]> {
  const sheetData = (await accessor.getRows(process.env.TWITTER_BOT_SPREADSHEET_ID, "Sheet1!A:B")).data.values;
  return parseSheetData(sheetData);
}

function parseSheetData(sheetData: string[][]): Tweet[] {
  sheetData.shift();
  return sheetData.map((tweet) => ({
    guid: tweet[0],
    title: tweet[1],
  }));
}
