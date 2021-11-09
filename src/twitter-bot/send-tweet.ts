import { TweetV1 } from "twitter-api-v2";
import { twitterClient } from "../clients/twitter";

export async function sendTweet(message: string): Promise<TweetV1> {
  return new Promise(async (resolve, reject) => {
    try {
      const createdTweet = await twitterClient.v1.tweet(message);
      console.log("Tweet", createdTweet.id_str, ":", createdTweet.full_text);
      resolve(createdTweet);
    } catch (err) {
      reject(err);
    }
  });
}
