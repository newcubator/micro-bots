import Parser from "rss-parser";
import { TweetV1 } from "twitter-api-v2";
import * as GoogleSheetsAccessor from "../clients/google-sheets-accessor";
import { twitterClient } from "../clients/twitter";
import { createNewTweet } from "../twitter-bot/createNewTweet";
import * as fetchTweetsFromSpreadsheet from "../twitter-bot/fetch-tweets-from-spreadsheet";
import * as fetchRssFeed from "../twitter-bot/fetch-rss-feed";
import { filterUntweetedFeed } from "../twitter-bot/filter-untweeted-feed";
import * as sendTweet from "../twitter-bot/send-tweet";
import * as saveToSpreadsheet from "../twitter-bot/save-to-spreadsheet";
import * as setUpSheetsAccessor from "../twitter-bot/set-up-sheets-accessor";
import { shortenFeedTitle } from "../twitter-bot/shorten-feed-title";
import { fakeRssFeedItemLong, fakeRssFeedItemShort, fakeRssFeed, fakeGoogleSheet } from "../__mocks__/twitter-api-v2";
import { RssFeedItem, Tweet } from "../twitter-bot/twitter-bot";
import { handler } from "./twitter-bot";

jest.mock("rss-parser");

const ParserMock = Parser as jest.MockedClass<typeof Parser>;

describe("TwitterBot", () => {
  it("should shorten tweets longer than 280 chars", () => {
    const result = createNewTweet(fakeRssFeedItemLong);
    expect(result.message).toHaveLength(280);
  });
  it("should not shorten tweets shorter than 280 chars", () => {
    const result = createNewTweet(fakeRssFeedItemShort);
    expect(result.message.length).toBeLessThanOrEqual(280);
  });
  it("should always start with 'Neues aus dem Entwicklerteam:' and end with #devsquad", () => {
    const result1 = createNewTweet(fakeRssFeedItemLong);
    const result2 = createNewTweet(fakeRssFeedItemShort);
    expect(result1.message).toContain("Neues aus dem Entwicklerteam:" && "#devsquad");
    expect(result2.message).toContain("Neues aus dem Entwicklerteam:" && "#devsquad");
  });

  it("should call Rss-Parser", async () => {
    expect(ParserMock).toHaveBeenCalledTimes(1);
  });
  it("should call Newcubator Website", async () => {
    const data = await fetchRssFeed.fetchRssFeed();
    expect(data).toEqual([]);
    expect(ParserMock.prototype.parseURL).toBeCalledWith("https://newcubator.com/devsquad/rss.xml");
  });

  it("should not filter similar Feed Item", () => {
    const result = filterUntweetedFeed(fakeRssFeed, fakeGoogleSheet);
    expect(result[0]).toBe(fakeRssFeed[1]);
  });

  it("should send a tweet", async () => {
    const message = "This is a tweet";
    await sendTweet.sendTweet(message);
    expect(twitterClient.v1.tweet).toBeCalledWith(message);
  });
  it('should log out "Tweet: something"', async () => {
    console.log = jest.fn();
    const message = "This is a tweet";
    await sendTweet.sendTweet(message);
    expect(console.log).toHaveBeenCalledWith("Tweet", "", ":", "");
  });
  it("should should send tweet with correct input", async () => {
    const googleSheetAccessorMock = jest
      .spyOn(setUpSheetsAccessor, "setUpSheetsAccessor")
      .mockResolvedValueOnce({ addRows: jest.fn() } as unknown as GoogleSheetsAccessor.GoogleSheetsAccessor);
    const fetchTweetsMock = jest
      .spyOn(fetchTweetsFromSpreadsheet, "fetchTweetsFromSpreadsheet")
      .mockResolvedValue(fakeGoogleSheet);
    const fetchRssMock = jest.spyOn(fetchRssFeed, "fetchRssFeed").mockResolvedValue(fakeRssFeed);
    const saveToSpreadsheetMock = jest.spyOn(saveToSpreadsheet, "saveToSpreadsheet");
    const sendTweetMock = jest.spyOn(sendTweet, "sendTweet").mockResolvedValue({} as TweetV1);
    await handler();
    expect(sendTweetMock).toHaveBeenCalled();
    expect(saveToSpreadsheetMock).toHaveBeenCalled();
  });
  it("should should send tweet with correct input2", async () => {
    const googleSheetAccessorMock = jest
      .spyOn(setUpSheetsAccessor, "setUpSheetsAccessor")
      .mockResolvedValueOnce({ addRows: jest.fn() } as unknown as GoogleSheetsAccessor.GoogleSheetsAccessor);
    const fetchTweetsMock = jest
      .spyOn(fetchTweetsFromSpreadsheet, "fetchTweetsFromSpreadsheet")
      .mockResolvedValue(fakeGoogleSheet);
    const fetchRssMock = jest.spyOn(fetchRssFeed, "fetchRssFeed").mockResolvedValueOnce([]);
    const saveToSpreadsheetMock = jest.spyOn(saveToSpreadsheet, "saveToSpreadsheet");
    const sendTweetMock = jest.spyOn(sendTweet, "sendTweet").mockResolvedValue({} as TweetV1);
    await handler();
    expect(sendTweetMock).toHaveBeenCalledTimes(0);
    expect(saveToSpreadsheetMock).toHaveBeenCalledTimes(0);
  });
});
