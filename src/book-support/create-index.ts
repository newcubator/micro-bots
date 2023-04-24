import {BookEntry} from "./types/bookEntry";
import {Dienstraeder} from "./embeddings/dienstrad";
import {Configuration, OpenAIApi} from "openai";
import {GoogleSheetsAccessor} from "../clients/google-sheets-accessor";
import {setUpSheetsAccessor} from "../twitter-bot/set-up-sheets-accessor";

const OPENAI_TOKEN = process.env.OPENAI_TOKEN;
const configuration = new Configuration({
    apiKey: OPENAI_TOKEN,
});
const openai = new OpenAIApi(configuration);

export async function createIndex(): Promise<void> {
    const googleSheetsAccessor = await setUpSheetsAccessor();
    for (const element of Dienstraeder) {
        const embedding = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: element.text,
        })
        element.vector = embedding.data.data[0].embedding.toString();
        await saveBookEntryVektor(element, googleSheetsAccessor);
    }
}

export async function saveBookEntryVektor(entry: BookEntry, googleSheetsAccessor: GoogleSheetsAccessor): Promise<any> {
    return googleSheetsAccessor.addRows(process.env.BOOK_SUPPORT_SPREADSHEET_ID, "Sheet1!A:B", [[entry.text], [entry.vector]]);
}