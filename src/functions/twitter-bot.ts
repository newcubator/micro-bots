import { composeTweetFromPost } from "../twitter-bot/composeTweetFromPost";
import { getAlreadyTweetedDevSquadPosts } from "../twitter-bot/get-already-tweeted-dev-squad-posts";
import { getDevSquadPosts } from "../twitter-bot/get-dev-squad-posts";
import { filterUntweetedDevSquadPosts } from "../twitter-bot/filter-untweeted-dev-squad-posts";
import { saveTweetedPost } from "../twitter-bot/save-tweeted-post";
import { tweet } from "../twitter-bot/tweet";
import { setUpSheetsAccessor } from "../twitter-bot/set-up-sheets-accessor";

export const handler = async () => {
  try {
    const googleSheetsAccessor = await setUpSheetsAccessor();
    const feed = await getDevSquadPosts();
    const tweets = await getAlreadyTweetedDevSquadPosts(googleSheetsAccessor);
    const notYetTweeted = filterUntweetedDevSquadPosts(feed, tweets);
    const newTweet = composeTweetFromPost(notYetTweeted[0]);
    saveTweetedPost(googleSheetsAccessor, newTweet)
      .then(async () => await tweet(newTweet.message))
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    console.error(err);
  }
};
