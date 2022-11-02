import { RssFeedItem, Tweet } from "./twitter-bot";

const { Configuration, OpenAIApi } = require("openai");

const OPENAI_TOKEN = process.env.OPENAI_TOKEN;

const configuration = new Configuration({
  apiKey: OPENAI_TOKEN,
});
const openai = new OpenAIApi(configuration);

export async function composeTweetWithOpenAI(feedItem: RssFeedItem): Promise<Tweet> {
  const openAIResponse = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `Write a tweet about the following content including three hashtags and not more then 250 characters: 
---
${feedItem.title}
${feedItem.content}
---
Tweet:
`,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  return {
    guid: feedItem.guid,
    title: feedItem.title,
    message: openAIResponse.data.choices[0].text + "\n" + feedItem.link,
  };
}