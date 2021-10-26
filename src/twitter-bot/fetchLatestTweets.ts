//Twittertimeline abfragen:
import { TweetUserTimelineV2Paginator, TweetV2, UserV2 } from 'twitter-api-v2';
import { twitterClient } from '../clients/twitter';

export async function fetchLatestTweets(): Promise<TweetV2[]> {
    const user: UserV2 = (await twitterClient.v2.userByUsername("newcubator")).data;
    const newcubatorTweets: TweetUserTimelineV2Paginator = await twitterClient.v2.userTimeline(user.id, {
        exclude: ["replies", "retweets"],
        max_results: 30,
    });
    return newcubatorTweets.tweets;
}
