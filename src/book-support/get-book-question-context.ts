import { Configuration, OpenAIApi } from "openai";
import { setUpSheetsAccessor } from "../twitter-bot/set-up-sheets-accessor";
import { parseBookEntries } from "./types/bookEntry";

const OPENAI_TOKEN = process.env.OPENAI_TOKEN;
const configuration = new Configuration({
  apiKey: OPENAI_TOKEN,
});
const openai = new OpenAIApi(configuration);

export async function getBookQuestionContext(question: string) {
  console.info("Trying to get embedding for question string");
  const questionEmbedding = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: question,
  });
  return compareEmbeddingVectors(questionEmbedding.data.data[0].embedding);
}

export const compareEmbeddingVectors = async (questionVector: number[]) => {
  const googleSheetsAccessor = await setUpSheetsAccessor();
  console.info("Loading embedding data from google sheet");
  const sheetData = (await googleSheetsAccessor.getRows(process.env.BOOK_SUPPORT_SPREADSHEET_ID, "Sheet1!A:B")).data
    .values;
  const bookEntryEmbeddings = parseBookEntries(sheetData);
  let highestSimilarityEmbedding = { similarity: 0, embedding: bookEntryEmbeddings[0] };

  bookEntryEmbeddings.forEach((embedding) => {
    const vector = embedding.vector.split(",").map((str) => parseFloat(str));
    const similarity = cosineSimilarity(vector, questionVector);
    if (similarity > highestSimilarityEmbedding.similarity) {
      highestSimilarityEmbedding = { similarity: similarity, embedding: embedding };
    }
  });
  return highestSimilarityEmbedding.embedding.text;
};

function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  // Überprüfen, ob die Vektoren die gleiche Länge haben
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors do not have the same length");
  }

  // Berechnung des Skalarprodukts
  let dotProduct = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }

  // Berechnung der Normen
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  // Berechnung der Kosinus-Ähnlichkeit
  return dotProduct / (normA * normB);
}
