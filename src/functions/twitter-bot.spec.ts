import Parser from "rss-parser";
import { AwsSecretsManager } from "../clients/aws-secrets-manager";
import { GoogleSheetsAccessor } from "../clients/google-sheets-accessor";
import { twitterClient } from "../clients/twitter";
import { composeTweetFromPost } from "../twitter-bot/composeTweetFromPost";
import * as fetchRssFeed from "../twitter-bot/get-dev-squad-posts";
import * as fetchTweetsFromSpreadsheet from "../twitter-bot/get-already-tweeted-dev-squad-posts";
import { filterUntweetedDevSquadPosts } from "../twitter-bot/filter-untweeted-dev-squad-posts";
import * as saveToSpreadsheet from "../twitter-bot/save-tweeted-post";
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

const secretsExample = {
  client_email: "email@email.com",
  private_key: "privatekey123",
};

const getRowsExample = {
  data: {
    values: [
      ["Guid", "Title"],
      ["111111", "Wie teste ich Rust und Java"],
      ["111115", "How to do something"],
    ],
  },
};

const fakeRssFeedItemLong = {
  creator: "Max Mustermann",
  title:
    "j4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAURj4RkRKjmHoV3iOG5d87vg4VmP9IVXvvgeznXpiGUru7WJodAUR",
  link: "FakeLink",
  pubDate: "FakeDate",
  content: "FakeContent",
  contentSnippet: "FakeSnippetContent",
  guid: "1234",
  isoDate: "FakeIsoDate",
};

const fakeRssFeedItemShort = {
  creator: "Max Mustermann",
  title: "j4RkRKjmHoV3iR",
  link: "FakeLink",
  pubDate: "FakeDate",
  content: "FakeContent",
  contentSnippet: "FakeSnippetContent",
  guid: "1234",
  isoDate: "FakeIsoDate",
};

//export const emptyFeedArray = [{}];

const fakeRssFeed = [
  {
    creator: "Max Mustermann",
    title: "Wie teste ich Rust und Java",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "111111",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "Wie teste ich Rust und Java 2",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "111112",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "Wie teste ich Python",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "111113",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "How to do something 3",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "111114",
    isoDate: "FakeIsoDate",
  },
  {
    creator: "Max Mustermann",
    title: "How to do something",
    link: "FakeLink",
    pubDate: "FakeDate",
    content: "FakeContent",
    contentSnippet: "FakeSnippetContent",
    guid: "111115",
    isoDate: "FakeIsoDate",
  },
];

const fakeGoogleSheet = [
  {
    guid: "111111",
    title: "Wie teste ich Rust und Java",
  },
  {
    guid: "111115",
    title: "How to do something",
  },
];

describe("TwitterBot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should shorten tweets longer than 280 chars", () => {
    const result = composeTweetFromPost(fakeRssFeedItemLong);
    expect(result.message).toHaveLength(280);
  });

  it("should not shorten tweets shorter than 280 chars", () => {
    const result = composeTweetFromPost(fakeRssFeedItemShort);
    expect(result.message.length).toBeLessThanOrEqual(280);
  });

  it("should always start with 'Neues aus dem Entwicklerteam:' and end with #devsquad", () => {
    const result1 = composeTweetFromPost(fakeRssFeedItemLong);
    const result2 = composeTweetFromPost(fakeRssFeedItemShort);
    expect(result1.message).toContain("Neues aus dem Entwicklerteam:" && "#devsquad");
    expect(result2.message).toContain("Neues aus dem Entwicklerteam:" && "#devsquad");
  });

  it("should call Newcubator Website", async () => {
    const data = await fetchRssFeed.getDevSquadPosts();
    expect(data).toEqual([]);
    expect(ParserMock.prototype.parseURL).toBeCalledWith("https://newcubator.com/devsquad/rss.xml");
  });

  it("should not filter similar Feed Item", () => {
    const result = filterUntweetedDevSquadPosts(fakeRssFeed, fakeGoogleSheet);
    expect(result[0]).toBe(fakeRssFeed[1]);
  });

  it("should fetch tweets from google sheet", async () => {
    const result = await fetchTweetsFromSpreadsheet.getAlreadyTweetedDevSquadPosts(new GoogleSheetsAccessor());
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
    jest.spyOn(fetchTweetsFromSpreadsheet, "getAlreadyTweetedDevSquadPosts").mockResolvedValue(fakeGoogleSheet);
    jest.spyOn(fetchRssFeed, "getDevSquadPosts").mockResolvedValue(fakeRssFeed);
    const saveToSpreadsheetMock = jest.spyOn(saveToSpreadsheet, "saveTweetedPost").mockResolvedValue({});

    await handler();

    expect(saveToSpreadsheetMock).toHaveBeenCalled();
    expect(twitterClient.v1.tweet).toHaveBeenCalled();
  });

  it("should not send", async () => {
    jest
      .spyOn(setUpSheetsAccessor, "setUpSheetsAccessor")
      .mockResolvedValueOnce({ addRows: jest.fn() } as unknown as GoogleSheetsAccessor);
    jest.spyOn(fetchTweetsFromSpreadsheet, "getAlreadyTweetedDevSquadPosts").mockResolvedValue(fakeGoogleSheet);
    jest.spyOn(fetchRssFeed, "getDevSquadPosts").mockResolvedValueOnce([]);
    jest.spyOn(fetchTweetsFromSpreadsheet, "getAlreadyTweetedDevSquadPosts").mockResolvedValueOnce([]);
    const saveToSpreadsheetMock = jest.spyOn(saveToSpreadsheet, "saveTweetedPost");

    await handler();

    expect(saveToSpreadsheetMock).not.toHaveBeenCalled();
    expect(twitterClient.v1.tweet).not.toHaveBeenCalled();
  });
});
