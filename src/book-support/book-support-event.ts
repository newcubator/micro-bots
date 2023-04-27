import { EventBridgeEvent } from "aws-lambda";
import { getBookQuestionContext } from "./get-book-question-context";
import { createIndex } from "./create-index";
import axios from "axios";
import { BookSupportRequestedEvent } from "../slack/interaction-handler";

const { Configuration, OpenAIApi } = require("openai");

export const handler = async (event: EventBridgeEvent<string, BookSupportRequestedEvent>) => {
  const OPENAI_TOKEN = process.env.OPENAI_TOKEN;
  const configuration = new Configuration({
    apiKey: OPENAI_TOKEN,
  });
  const openai = new OpenAIApi(configuration);
  const question = event.detail.text;

  //Initial Index zu den eigenen Daten generieren
  if (event.detail.createIndex) {
    await createIndex(openai);
  }

  const context = await getBookQuestionContext(question, openai);
  const openAIResponse = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `Gegeben ist folgender Kontext:
         """ ${context} """ .
        Beantworte im Bezug auf den Kontext folgende Frage möglichst ausführlich: """ ${question} """`,
    temperature: 0.2,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const responseText = openAIResponse.data.choices[0].text;
  console.info("Tokens used: " + openAIResponse.data.usage);

  await axios.post(event.detail.responseUrl, {
    replace_original: "true",
    text: `Frage:${question}\nAntwort:${responseText}`,
  });
};
