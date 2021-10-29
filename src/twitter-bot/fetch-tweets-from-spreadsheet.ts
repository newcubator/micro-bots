import { GoogleSheetsAccessor } from '../clients/google-sheets-accessor';
import { Tweet } from './twitter-bot';

export async function fetchTweetsFromSpreadsheet(accessor: GoogleSheetsAccessor): Promise<Tweet[]>{
    const sheetData = (await accessor.getRows(process.env.TWITTER_BOT_SPREADSHEET_ID, "Sheet1!A:C")).data
        .values;
    return parseSheetData(sheetData);
}

function parseSheetData(sheetData: string[][]): Tweet[] {
    sheetData.shift();
    return sheetData.map((tweet) => ({
        guid: tweet[0],
        title: tweet[1],
    }));
}

