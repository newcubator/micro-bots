import { EventBridgeEvent } from "aws-lambda";
import {getBookQuestionContext} from "./get-book-question-context";
import {createIndex} from "./create-index";
import axios from "axios";
import {BookSupportRequestedEvent, CompletionNoticeRequestedEvent} from "../slack/interaction-handler";

const {Configuration, OpenAIApi} = require("openai");


export const handler = async (event: EventBridgeEvent<string, BookSupportRequestedEvent>) => {
    const OPENAI_TOKEN = process.env.OPENAI_TOKEN;
    const configuration = new Configuration({
        apiKey: OPENAI_TOKEN,
    });
    const openai = new OpenAIApi(configuration);
    const question = event.detail.text;
    let responseText = "";
    //await createIndex();

    const context  = await getBookQuestionContext(question);
    const openAIResponse = await openai.createCompletion({
        model: "text-davinci-002",
        prompt:
        `Gegeben ist folgender Kontext: ${context} .
        Beantworte im Bezug auf den Kontext folgende Frage: ${question} .`,
        temperature: 0.2,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    responseText = openAIResponse.data.choices[0].text;


    await axios.post(event.detail.responseUrl, {
        replace_original: "true",
        text: responseText,
    })
};


