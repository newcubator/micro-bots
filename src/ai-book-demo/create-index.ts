import { OpenAIApi } from "openai";
import { setUpSheetsAccessor } from "../twitter-bot/set-up-sheets-accessor";
import { getRowsFromGoogleSheet, saveBookEntryVector } from "./google-sheet/book-support-google-sheet";

export async function createIndex(openai: OpenAIApi): Promise<void> {
  const googleSheetsAccessor = await setUpSheetsAccessor();
  const bookEntries = await getRowsFromGoogleSheet(googleSheetsAccessor);
  for (const element of bookEntries) {
    if (!element.vector) {
      const embedding = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: element.text,
      });
      element.vector = embedding.data.data[0].embedding.toString();
      await saveBookEntryVector(element, googleSheetsAccessor);
    }
  }
}
