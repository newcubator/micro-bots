import { OpenAIApi } from "openai";
import { setUpSheetsAccessor } from "./set-up-sheets-accessor";
import { parseBookEntries } from "./google-sheet/book-support-google-sheet";

export async function getBookQuestionContext(question: string, openai: OpenAIApi) {
  console.info("Get embedding for question string");
  const questionEmbedding = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: question,
  });
  return compareEmbeddingVectors(questionEmbedding.data.data[0].embedding);
}

async function compareEmbeddingVectors(questionVector: number[]) {
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
}

function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors do not have the same length");
  }

  let scalarProduct = 0;
  for (let i = 0; i < vectorA.length; i++) {
    scalarProduct += vectorA[i] * vectorB[i];
  }

  // Calculation of the standards
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  // Calculation of the cosine similarity
  return scalarProduct / (normA * normB);
}
