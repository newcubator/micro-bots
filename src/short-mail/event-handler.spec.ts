import axios from "axios";
import dayjs from "dayjs";
import MockDate from "mockdate";
import { eventHandler } from "./event-handler";
import { getCompanyById } from "../moco/companies";
import { getContactById } from "../moco/contacts";
import { getSlackUserProfile, slackChatPostEphemeral } from "../slack/slack";
import { renderShortMailPdf } from "./pdf";
import { slackClient } from "../clients/slack";

MockDate.set("2022-01-02");

jest.mock("../moco/companies");
jest.mock("../moco/contacts");
jest.mock("../slack/slack");
jest.mock("./pdf");

const axiosPostMock = axios.post as jest.Mock;
const mocoCompanieMock = getCompanyById as jest.Mock;
const mocoContactMock = getContactById as jest.Mock;
const shortMailRenderPdfMock = renderShortMailPdf as jest.Mock;
const slackConversationsJoinMock = slackClient.conversations.join as jest.Mock;
const slackFileUploadMock = slackClient.files.upload as jest.Mock;
const slackPostEphemeralMock = slackChatPostEphemeral as jest.Mock;
const slackUserProfileMock = getSlackUserProfile as jest.Mock;

describe("ShortmailEventHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle event short mail generation hannover to female without company adress", async () => {
    mocoContactMock.mockResolvedValueOnce({
      id: 2,
      gender: "F",
      firstname: "Melinda",
      lastname: "Gates",
      work_address: "\nFensterstraße 1\n12345 Fensterhausen ",
      company: null,
    });

    shortMailRenderPdfMock.mockResolvedValueOnce(Buffer.from("pdf"));

    slackUserProfileMock.mockResolvedValueOnce({
      ok: true,
      profile: {
        real_name: "Max Mustermann",
      },
    });

    await eventHandler({
      detail: {
        responseUrl: "https://slack.com/response_url",
        personId: "2",
        message: "Testnachricht an Melinda",
        sender: "1337",
        messageTs: "1633540187.000600",
        channelId: "C02BBA8DWVD",
        location: "H",
      },
    } as any);

    expect(mocoCompanieMock).toHaveBeenCalledTimes(0);
    expect(slackUserProfileMock).toHaveBeenCalledWith("1337");
    expect(mocoContactMock).toHaveBeenCalledWith("2");
    expect(shortMailRenderPdfMock).toHaveBeenCalledWith({
      sender: "Max Mustermann",
      location: "H",
      recipient: {
        salutation: "Sehr geehrte Frau Gates",
        firstname: "Melinda",
        lastname: "Gates",
        address: "\nFensterstraße 1\n12345 Fensterhausen ",
      },
      date: dayjs(),
      text: "Testnachricht an Melinda",
    });
    expect(slackConversationsJoinMock).toHaveBeenCalledWith({ channel: "C02BBA8DWVD" });
    expect(slackFileUploadMock).toHaveBeenCalledWith({
      file: expect.anything(),
      filename: "Kurzbrief Gates.pdf",
      initial_comment: "",
      channels: "C02BBA8DWVD",
      thread_ts: "1633540187.000600",
      broadcast: "true",
    });
    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringContaining("Melinda Gates"),
    });
  });

  it("should handle event short mail generation dortmund to male with company address", async () => {
    mocoContactMock.mockResolvedValueOnce({
      id: 1,
      gender: "H",
      firstname: "Bill",
      lastname: "Gates",
      work_address: "\nFensterstraße 1\n12345 Fensterhausen ",
      company: {
        id: 42,
        type: "Firma",
        name: "Guugel",
      },
    });
    mocoCompanieMock.mockResolvedValueOnce({
      id: 42,
      name: "Guugel",
      address: "Suchallee 42\n54321 Suchstadt",
    });

    shortMailRenderPdfMock.mockResolvedValueOnce(Buffer.from("pdf"));

    slackUserProfileMock.mockResolvedValueOnce({
      ok: true,
      profile: {
        real_name: "Max Mustermann",
      },
    });

    await eventHandler({
      detail: {
        responseUrl: "https://slack.com/response_url",
        personId: "1",
        message: "Testnachricht an Bill",
        sender: "1337",
        messageTs: "1633540187.000600",
        channelId: "C02BBA8DWVD",
        location: "D",
      },
    } as any);

    expect(mocoCompanieMock).toHaveBeenCalledWith(42);
    expect(slackUserProfileMock).toHaveBeenCalledWith("1337");
    expect(mocoContactMock).toHaveBeenCalledWith("1");
    expect(shortMailRenderPdfMock).toHaveBeenCalledWith({
      sender: "Max Mustermann",
      location: "D",
      recipient: {
        salutation: "Sehr geehrter Herr Gates",
        firstname: "Bill",
        lastname: "Gates",
        address: "Suchallee 42\n54321 Suchstadt",
      },
      date: dayjs(),
      text: "Testnachricht an Bill",
    });
    expect(slackConversationsJoinMock).toHaveBeenCalledWith({ channel: "C02BBA8DWVD" });
    expect(slackFileUploadMock).toHaveBeenCalledWith({
      file: expect.anything(),
      filename: "Kurzbrief Gates.pdf",
      initial_comment: "",
      channels: "C02BBA8DWVD",
      thread_ts: "1633540187.000600",
      broadcast: "true",
    });
    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringContaining("Bill Gates"),
    });
  });
});
