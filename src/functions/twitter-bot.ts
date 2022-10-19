import { composeTweetWithOpenAI } from "../twitter-bot/composeTweetWithOpenAI";
import { getAlreadyTweetedDevSquadPosts } from "../twitter-bot/get-already-tweeted-dev-squad-posts";
import { getDevSquadPosts } from "../twitter-bot/get-dev-squad-posts";
import { filterUntweetedDevSquadPosts } from "../twitter-bot/filter-untweeted-dev-squad-posts";
import { saveTweetedPost } from "../twitter-bot/save-tweeted-post";
import { setUpSheetsAccessor } from "../twitter-bot/set-up-sheets-accessor";
import { twitterClient } from "../clients/twitter";
import { slackChatPostMessage } from "../slack/slack";

const TWITTER_POST_SLACK_CHANNEL = process.env.TWITTER_POST_SLACK_CHANNEL;

export const handler = async () => {
  try {
    const googleSheetsAccessor = await setUpSheetsAccessor();
    const feed = await getDevSquadPosts();
    const tweets = await getAlreadyTweetedDevSquadPosts(googleSheetsAccessor);
    const notYetTweeted = filterUntweetedDevSquadPosts(feed, tweets);

    console.info(`Found ${notYetTweeted.length} possible Tweets.`);

    if (notYetTweeted.length) {
      const plannedTweet = await composeTweetWithOpenAI(notYetTweeted[0]);
      console.info(`Planned Tweeting ${plannedTweet.guid}: ${plannedTweet.message}`);

      if (process.env.AWS_LAMBDA_FUNCTION_NAME?.includes("production")) {
        await saveTweetedPost(googleSheetsAccessor, plannedTweet);
        console.info("Saved new Tweet.");

        const createdTweet = await twitterClient.v1.tweet(plannedTweet.message);
        console.info(`Tweeted ${createdTweet.id_str}: ${createdTweet.full_text}`);

        const messageResponse = await slackChatPostMessage(
          `Es wurde ein DevSquad Artikel auf Twitter veröffentlicht: https://twitter.com/newcubator/status/${createdTweet.id_str}`,
          TWITTER_POST_SLACK_CHANNEL,
          "Twitter Bot",
          ":bird:"
        );
        console.log(`Wrote message ${JSON.stringify(messageResponse)}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
};
