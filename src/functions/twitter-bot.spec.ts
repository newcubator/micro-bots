import Parser from "rss-parser";
import { twitterClient } from "../clients/twitter";
import { createNewTweet } from "../twitter-bot/createNewTweet";
import { fetchLatestTweets } from "../twitter-bot/fetchLatestTweets";
import { fetchRssFeed } from "../twitter-bot/fetchRssFeed";
import { filterUntweetedFeed } from "../twitter-bot/filterUntweetedFeed";
import { sendTweet } from "../twitter-bot/sendTweet";
import { unEscape } from "../twitter-bot/unEscape";

import {
  fakeRssFeedItemLong,
  fakeRssFeedItemShort,
  fakeRssFeed,
  fakeTwitterTimeline,
} from "../__mocks__/twitter-api-v2";
jest.mock("rss-parser");
const ParserMock = Parser as jest.MockedClass<typeof Parser>;
const twitterUserByUsernameMock = twitterClient.v2.userByUsername as jest.Mock;
const twitterUserTimelineMock = twitterClient.v2.userTimeline as jest.Mock;

describe("TwitterBot", () => {
  it("successful tweets", async () => {
    twitterUserByUsernameMock.mockResolvedValueOnce({
      data: {
        id: 123456,
      },
    });
    twitterUserTimelineMock.mockResolvedValueOnce({
      tweets: [],
    });
    const data = await fetchLatestTweets();
    expect(data).toEqual([]);
    expect(twitterUserByUsernameMock).toHaveBeenCalledWith("newcubator");
    expect(twitterUserTimelineMock).toHaveBeenCalledWith(123456, {
      exclude: ["replies", "retweets"],
      max_results: 30,
    });
    expect(twitterUserTimelineMock).toHaveBeenCalledTimes(1);
  });
  it("failed tweets", async () => {});

  it.each([
    ["test &amp; test", "test & test"],
    ["test &gt; test", "test > test"],
    ["test &lt; test", "test < test"],
    ["test &quot; test", 'test " test'],
    ["test &#39; test", "test ' test"],
  ])("HTML unescape", (a, expected) => {
    expect(unEscape(a)).toEqual(expected);
  });

  it("Shorten tweets longer than 280 chars", () => {
    const result = createNewTweet(fakeRssFeedItemLong);
    expect(result).toHaveLength(280);
  });
  it("Not shorten tweets shorter than 280 chars", () => {
    const result = createNewTweet(fakeRssFeedItemShort);
    expect(result.length).toBeLessThanOrEqual(280);
  });
  it("Always start with 'Neues aus dem Entwicklerteam:' and end with #devsquad", () => {
    const result1 = createNewTweet(fakeRssFeedItemLong);
    const result2 = createNewTweet(fakeRssFeedItemShort);
    expect(result1).toContain("Neues aus dem Entwicklerteam:" && "#devsquad");
    expect(result2).toContain("Neues aus dem Entwicklerteam:" && "#devsquad");
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
    const result = filterUntweetedFeed(fakeRssFeed, fakeTwitterTimeline);
    expect(result[0]).toBe(fakeRssFeed[1]);
  });

  it("should send a tweet", async () => {
    const message = "This is a tweet";
    await sendTweet(message);
    expect(twitterClient.v1.tweet).toBeCalledWith(message);
  });
});
