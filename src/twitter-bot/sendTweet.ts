import { twitterClient } from '../clients/twitter';

export async function sendTweet(message: string) {
    const createdTweet = await twitterClient.v1.tweet(message);
    console.log("Tweet", createdTweet.id_str, ":", createdTweet.full_text);
}
