import { RssFeedItem } from '../functions/twitter-bot';
import { shortenFeedTitle } from './shortenFeedTitle';

export function createNewTweet(feedItem: RssFeedItem) {
    let tweetText = `Neues aus dem Entwicklerteam: ${feedItem.title} ${feedItem.link} #devsquad`;
    if (tweetText.length > 280) {
        tweetText = `Neues aus dem Entwicklerteam: ${shortenFeedTitle(feedItem.title, tweetText.length)}... ${
            feedItem.link
        } #devsquad`;
    }
    return tweetText;
}
