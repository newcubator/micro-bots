import Parser from "rss-parser";
import { twitterClient } from "../clients/twitter";
import { createNewTweet, fetchLatestTweets, unEscape, tweetedRssGuids, fetchRssFeed } from "./twitter-bot";
import {
  fakeRssFeedItemLong,
  fakeRssFeedItemShort,
  fakeRssFeed,
  fakeTwitterTimeline,
} from "../__mocks__/twitter-api-v2";

jest.mock("rss-parser");
const ParserMock = Parser as jest.MockedClass<typeof Parser>;
// const parserUrlMock = ParserMock.parseURL as jest.Mock;
const twitterUserByUsernameMock = twitterClient.v2.userByUsername as jest.Mock;
const twitterUserTimelineMock = twitterClient.v2.userTimeline as jest.Mock;

describe("fetchLatestTweets", () => {
  test("successful tweets", async () => {
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
  /*test("failed to fetch tweets", async () => {
    twitterUserByUsernameMock.mockResolvedValueOnce({
      data: {
        id: "newcubator",
      },
    });
    twitterUserTimelineMock.mockResolvedValueOnce({
      tweets: [],
    });

    await expect(fetchLatestTweets()).rejects;
    expect(twitterUserByUsernameMock).toHaveBeenCalledWith("newcubator");
  }); */
});

describe.each([
  ["test &amp; test", "test & test"],
  ["test &gt; test", "test > test"],
  ["test &lt; test", "test < test"],
  ["test &quot; test", 'test " test'],
  ["test &#39; test", "test ' test"],
])("HTML unescape", (a, expected) => {
  test(`returns ${expected}`, () => {
    expect(unEscape(a)).toEqual(expected);
  });
});

describe("Shorten Tweets", () => {
  it("Tweet longer than 280 chars", () => {
    const result = createNewTweet(fakeRssFeedItemLong);
    expect(result).toHaveLength(280);
  });
  it("Tweet shorter than 280 chars", () => {
    const result = createNewTweet(fakeRssFeedItemShort);
    expect(result.length).toBeLessThanOrEqual(280);
  });
});

describe("Fetch Rss-Feed", () => {
  it("Calling Rss-Parser", async () => {
    expect(ParserMock).toHaveBeenCalledTimes(1);
  });
  it("Calling Newcubator Website", async () => {
    const data = await fetchRssFeed();
    expect(data).toEqual([]);
    expect(ParserMock.prototype.parseURL).toBeCalledWith("https://newcubator.com/devsquad/rss.xml");
  });
});

describe("Filter Rss-Feed", () => {
  it("Dont filter similar Feed Item", () => {
    const result = tweetedRssGuids(fakeRssFeed, fakeTwitterTimeline);
    expect(result[0]).toBe(fakeRssFeed[0]);
  });
});
