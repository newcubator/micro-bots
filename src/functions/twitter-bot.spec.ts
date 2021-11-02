import Parser from "rss-parser";
import { twitterClient } from "../clients/twitter";
import { createNewTweet } from "../twitter-bot/createNewTweet";
import { fetchTweetsFromSpreadsheet } from "../twitter-bot/fetch-tweets-from-spreadsheet";
import { fetchRssFeed } from "../twitter-bot/fetchRssFeed";
import { filterUntweetedFeed } from "../twitter-bot/filterUntweetedFeed";
import { sendTweet } from "../twitter-bot/sendTweet";
import { saveToSpreadsheet } from "../twitter-bot/saveToSpreadsheet";
import { setUpSheetsAccessor } from "../twitter-bot/set-up-sheets-accessor";
import { shortenFeedTitle } from "../twitter-bot/shortenFeedTitle";
import { fakeRssFeedItemLong, fakeRssFeedItemShort, fakeRssFeed, fakeGoogleSheet } from "../__mocks__/twitter-api-v2";

jest.mock("rss-parser");
const ParserMock = Parser as jest.MockedClass<typeof Parser>;

describe("TwitterBot", () => {
  it("Shorten tweets longer than 280 chars", () => {
    const result = createNewTweet(fakeRssFeedItemLong);
    expect(result.message).toHaveLength(280);
  });
  it("Not shorten tweets shorter than 280 chars", () => {
    const result = createNewTweet(fakeRssFeedItemShort);
    expect(result.message.length).toBeLessThanOrEqual(280);
  });
  it("Always start with 'Neues aus dem Entwicklerteam:' and end with #devsquad", () => {
    const result1 = createNewTweet(fakeRssFeedItemLong);
    const result2 = createNewTweet(fakeRssFeedItemShort);
    expect(result1.message).toContain("Neues aus dem Entwicklerteam:" && "#devsquad");
    expect(result2.message).toContain("Neues aus dem Entwicklerteam:" && "#devsquad");
  });

  it("Calling Rss-Parser", async () => {
    expect(ParserMock).toHaveBeenCalledTimes(1);
  });
  it("Calling Newcubator Website", async () => {
    const data = await fetchRssFeed();
    expect(data).toEqual([]);
    expect(ParserMock.prototype.parseURL).toBeCalledWith("https://newcubator.com/devsquad/rss.xml");
  });

  it("Dont filter similar Feed Item", () => {
    const result = filterUntweetedFeed(fakeRssFeed, fakeGoogleSheet);
    expect(result[0]).toBe(fakeRssFeed[1]);
  });

  it("should send a tweet", async () => {
    const message = "This is a tweet";
    await sendTweet(message);
    expect(twitterClient.v1.tweet).toBeCalledWith(message);
  });
  it('should log out "Tweet: something"', async () => {
    console.log = jest.fn();
    const message = "This is a tweet";
    await sendTweet(message);
    expect(console.log).toHaveBeenCalledWith("Tweet", "", ":", "");
  });
});
