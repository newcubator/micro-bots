import { EventBridgeEvent } from "aws-lambda";
import { getBookQuestionContext } from "./get-book-question-context";
import { createIndex } from "./create-index";
import axios from "axios";
import { AiBookDemoRequestedEvent } from "../slack/interaction-handler";

const { Configuration, OpenAIApi } = require("openai");

export const handler = async (event: EventBridgeEvent<string, AiBookDemoRequestedEvent>) => {
  const OPENAI_TOKEN = process.env.OPENAI_TOKEN;
  const configuration = new Configuration({
    apiKey: OPENAI_TOKEN,
  });
  const openai = new OpenAIApi(configuration);
  const question = event.detail.text;

  //Generate initial index to own data
  if (event.detail.createIndex) {
    await createIndex(openai);
  }

  const context = await getBookQuestionContext(question, openai);
  const openAIResponse = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `Wenn du die Frage mit den gegebenen Informationen nicht sinnvoll beantworten kannst, antworte mit "Das weiß ich nicht". Gegeben ist folgender Kontext: """${context} """.
        Beantworte im Bezug auf den Kontext folgende Frage möglichst ausführlich und auf deutsch: " ${question}". Antwort:`,
    temperature: 0.2,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const responseText = openAIResponse.data.choices[0].text;
  console.info(
    "Prompt tokens used: " +
      openAIResponse.data.usage?.prompt_tokens +
      ". Completion tokens used: " +
      openAIResponse.data.usage?.completion_tokens +
      ". Total tokens used: " +
      openAIResponse.data.usage?.total_tokens,
  );

  await axios.post(event.detail.responseUrl, {
    replace_original: "true",
    text: `Frage:${question}\nAntwort:${responseText}`,
  });
};
