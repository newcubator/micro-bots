import { composeTweetWithOpenAI } from "../twitter-bot/composeTweetWithOpenAI";
import { getAlreadyTweetedDevSquadPosts } from "../twitter-bot/get-already-tweeted-dev-squad-posts";
import { getDevSquadPosts } from "../twitter-bot/get-dev-squad-posts";
import { filterUntweetedDevSquadPosts } from "../twitter-bot/filter-untweeted-dev-squad-posts";
import { saveTweetedPost } from "../twitter-bot/save-tweeted-post";
import { setUpSheetsAccessor } from "../twitter-bot/set-up-sheets-accessor";
import { slackChatPostMessage } from "../slack/slack";

const TWITTER_POST_SLACK_CHANNEL = process.env.TWITTER_POST_SLACK_CHANNEL;

export const handler = async () => {
  try {
    console.info("Twitter Bot requested");
    const googleSheetsAccessor = await setUpSheetsAccessor();
    console.info("Successfully set up sheets accessor");
    const feed = await getDevSquadPosts();
    const tweets = await getAlreadyTweetedDevSquadPosts(googleSheetsAccessor);
    const notYetTweeted = filterUntweetedDevSquadPosts(feed, tweets);

    console.info(`Found ${notYetTweeted.length} possible Tweets.`);

    if (notYetTweeted.length) {
      const plannedTweet = await composeTweetWithOpenAI(notYetTweeted[0]);
      console.info(`Planned Tweeting ${plannedTweet.guid}: ${plannedTweet.message}`);

      await saveTweetedPost(googleSheetsAccessor, plannedTweet);
      console.info("Saved new Tweet.");

      const messageResponse = await slackChatPostMessage(
        `Es wurde ein DevSquad Artikel auf Twitter veröffentlicht: ${plannedTweet.message}`,
        TWITTER_POST_SLACK_CHANNEL,
        "Twitter Bot",
        ":bird:"
      );
      console.log(`Wrote message ${JSON.stringify(messageResponse)}`);
    }
  } catch (err) {
    console.error(err);
  }
};
