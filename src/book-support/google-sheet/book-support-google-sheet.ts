import { GoogleSheetsAccessor } from "../../clients/google-sheets-accessor";
import { BookEntry, parseBookEntries } from "../types/bookEntry";

export async function getRowsFromGoogleSheet(googleSheetsAccessor: GoogleSheetsAccessor): Promise<BookEntry[]> {
  console.info("Loading text data from google sheet");
  const sheetData = (await googleSheetsAccessor.getRows(process.env.BOOK_SUPPORT_SPREADSHEET_ID, "Sheet1!A:B")).data
    .values;
  return parseBookEntries(sheetData);
}

export async function saveBookEntryVector(entry: BookEntry, googleSheetsAccessor: GoogleSheetsAccessor): Promise<void> {
  await googleSheetsAccessor.addRows(process.env.BOOK_SUPPORT_SPREADSHEET_ID, `Sheet1!B${entry.index}`, [
    [entry.vector],
  ]);
}
