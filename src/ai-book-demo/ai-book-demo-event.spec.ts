import { handler } from "./ai-book-demo-event";
import axios from "axios";
import { ActionType } from "../slack/types/slack-types";
import { getBookQuestionContext } from "./get-book-question-context";
import * as bookSupportGoogleSheetModule from "./google-sheet/book-support-google-sheet";
import { createIndex } from "./create-index";
import { OpenAIApi } from "openai";

const axiosPostMock = axios.post as jest.Mock;
const openAiMock = new OpenAIApi();

jest.mock("openai", () => {
  return {
    Configuration: jest.fn().mockImplementation(),
    OpenAIApi: jest.fn().mockImplementation(() => ({
      createCompletion: jest.fn().mockResolvedValue({
        data: {
          choices: [
            {
              text: "Das ist eine Testantwort.",
            },
          ],
        },
      }),
      createEmbedding: jest.fn().mockResolvedValue({
        data: {
          data: [
            {
              embedding: [0.1, 1.1, 1.1],
            },
          ],
        },
      }),
    })),
  };
});

jest.mock("../clients/google-sheets-accessor", () => {
  return {
    GoogleSheetsAccessor: jest.fn().mockImplementation(() => ({
      getRows: () => getRowsExample,
      addRows: () => jest.fn(),
      setupGoogle: () => Promise.resolve(true),
    })),
  };
});

let getRowsExample;

describe("Book Support", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getRowsExample = {
      data: {
        values: [
          ["text", "vector"],
          ["Das ist der ähnlichste Vektor", "0.1,1.1,1.1"],
          ["Das ist ein ganz anderer Vektor", "1.1,1.1,0.1"],
        ],
      },
    };
  });

  it("should generate response with open ai", async () => {
    await handler({
      detail: {
        text: "Das ist eine Testfrage",
        responseUrl: "https://slack.com/response_url",
        channelId: "1",
        actionType: ActionType.BOOK_SUPPORT,
        createIndex: false,
      },
    } as any);

    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringContaining("Frage:Das ist eine Testfrage\nAntwort:Das ist eine Testantwort."),
    });
  });

  it("should compare embedding vectors and return highest similarity", async () => {
    const result = await getBookQuestionContext("Das ist ein Vektor", openAiMock);
    expect(result).toEqual("Das ist der ähnlichste Vektor");
  });

  it("should create index and save to google sheet", async () => {
    const spy = jest.spyOn(bookSupportGoogleSheetModule, "saveBookEntryVector");
    getRowsExample = {
      data: {
        values: [
          ["text", "vector"],
          ["Das ist der ähnlichste Vektor", "0.1,1.1,1.1"],
          ["Das ist ein ganz anderer Vektor", "1.1,1.1,0.1"],
          ["Das ist ein ganz anderer Vektor", undefined],
        ],
      },
    };
    await createIndex(openAiMock);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
