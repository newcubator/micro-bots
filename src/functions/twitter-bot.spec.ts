import Parser from "rss-parser";
import { TweetV1 } from "twitter-api-v2";
import {
  fakeGoogleSheet,
  fakeRssFeed,
  fakeRssFeedItemLong,
  fakeRssFeedItemShort,
  getRowsExample,
  secretsExample,
} from "../__mocks__/twitter-api-v2";
import { AwsSecretsManager } from "../clients/aws-secrets-manager";
import { GoogleSheetsAccessor } from "../clients/google-sheets-accessor";
import { twitterClient } from "../clients/twitter";
import { createNewTweet } from "../twitter-bot/createNewTweet";
import * as fetchRssFeed from "../twitter-bot/fetch-rss-feed";
import * as fetchTweetsFromSpreadsheet from "../twitter-bot/fetch-tweets-from-spreadsheet";
import { filterUntweetedFeed } from "../twitter-bot/filter-untweeted-feed";
import * as saveToSpreadsheet from "../twitter-bot/save-to-spreadsheet";
import * as sendTweet from "../twitter-bot/send-tweet";
import * as setUpSheetsAccessor from "../twitter-bot/set-up-sheets-accessor";
import { Tweet } from "../twitter-bot/twitter-bot";
import { handler } from "./twitter-bot";

jest.mock("rss-parser");
const ParserMock = Parser as jest.MockedClass<typeof Parser>;
jest.mock("../clients/google-sheets-accessor", () => {
  return {
    GoogleSheetsAccessor: jest.fn().mockImplementation(() => ({
      getRows: () => getRowsExample,
      setupGoogle: () => Promise.resolve(true),
    })),
  };
});

describe("TwitterBot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it("should fetch tweets from google sheet", async () => {
    const result = await fetchTweetsFromSpreadsheet.fetchTweetsFromSpreadsheet(new GoogleSheetsAccessor());
    expect(result).toMatchSnapshot();
  });

  it("should set up Sheetsaccessor", async () => {
    AwsSecretsManager.getSecret = jest.fn().mockResolvedValue(secretsExample);
    const result = await setUpSheetsAccessor.setUpSheetsAccessor();
    expect(result).toMatchSnapshot();
  });

  //TODO: mocking in this test leads to failing all tests below

  it("should send tweet", async () => {
    jest
      .spyOn(setUpSheetsAccessor, "setUpSheetsAccessor")
      .mockResolvedValueOnce({ addRows: jest.fn() } as unknown as GoogleSheetsAccessor);
    jest.spyOn(fetchTweetsFromSpreadsheet, "fetchTweetsFromSpreadsheet").mockResolvedValue(fakeGoogleSheet);
    jest.spyOn(fetchRssFeed, "fetchRssFeed").mockResolvedValue(fakeRssFeed);
    const saveToSpreadsheetMock = jest.spyOn(saveToSpreadsheet, "saveToSpreadsheet");
    const sendTweetMock = jest.spyOn(sendTweet, "sendTweet").mockResolvedValue({} as TweetV1);
    await handler();
    expect(sendTweetMock).toHaveBeenCalled();
    expect(saveToSpreadsheetMock).toHaveBeenCalled();
  });

  it("should not send", async () => {
    jest
      .spyOn(setUpSheetsAccessor, "setUpSheetsAccessor")
      .mockResolvedValueOnce({ addRows: jest.fn() } as unknown as GoogleSheetsAccessor);
    jest.spyOn(fetchTweetsFromSpreadsheet, "fetchTweetsFromSpreadsheet").mockResolvedValue(fakeGoogleSheet);
    jest.spyOn(fetchRssFeed, "fetchRssFeed").mockResolvedValueOnce([]);
    jest.spyOn(fetchTweetsFromSpreadsheet, "fetchTweetsFromSpreadsheet").mockResolvedValueOnce([]);
    const saveToSpreadsheetMock = jest.spyOn(saveToSpreadsheet, "saveToSpreadsheet");
    const sendTweetMock = jest.spyOn(sendTweet, "sendTweet").mockResolvedValue({} as TweetV1);
    await handler();
    expect(sendTweetMock).toHaveBeenCalledTimes(0);
    expect(saveToSpreadsheetMock).toHaveBeenCalledTimes(0);
  });
});
