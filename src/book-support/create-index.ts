import { Configuration, OpenAIApi } from "openai";
import { setUpSheetsAccessor } from "../twitter-bot/set-up-sheets-accessor";
import { getRowsFromGoogleSheet, saveBookEntryVector } from "./google-sheet/book-support-google-sheet";

const OPENAI_TOKEN = process.env.OPENAI_TOKEN;
const configuration = new Configuration({
  apiKey: OPENAI_TOKEN,
});
const openai = new OpenAIApi(configuration);

export async function createIndex(): Promise<void> {
  const googleSheetsAccessor = await setUpSheetsAccessor();
  const bookEntries = await getRowsFromGoogleSheet(googleSheetsAccessor);
  for (const element of bookEntries) {
    const embedding = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: element.text,
    });
    element.vector = embedding.data.data[0].embedding.toString();
    await saveBookEntryVector(element, googleSheetsAccessor);
  }
}
