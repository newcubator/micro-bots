import axios from "axios";
import {
  getRealSlackName,
  slackConversationsCreate,
  slackConversationsInvite,
  slackConversationsList,
  slackUsersList,
} from "../slack/slack";
import { eventHandler } from "./event-handler";

jest.mock("../slack/slack");

const getSlackNameMock = getRealSlackName as jest.Mock;
const slackConversationsCreateMock = slackConversationsCreate as jest.Mock;
const slackConversationsListMock = slackConversationsList as jest.Mock;
const slackConversationsInviteMock = slackConversationsInvite as jest.Mock;
const slackUsersListMock = slackUsersList as jest.Mock;
const axiosPostMock = axios.post as jest.Mock;

describe("Private Channel Bot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should handle event with same channel name", async () => {
    getSlackNameMock.mockResolvedValueOnce({ profile: { realName: "Bill Gates" } });
    slackConversationsListMock.mockResolvedValueOnce({ channels: [{ name: "Gleicher_Testchannel" }] });
    slackUsersListMock.mockResolvedValueOnce({ members: [{ id: "1" }, { id: "2" }] });
    slackConversationsCreateMock.mockResolvedValueOnce({ channel: { id: 1337 } });

    await eventHandler({
      detail: {
        personId: ["1"],
        channelName: "Gleicher_Testchannel",
        responseUrl: "https://slack.com/response_url",
        messageTs: "1633540187.000600",
        channelId: "C02BBA8DWVD",
        actionId: "PRIVATE_CHANNEL",
      },
    } as any);

    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringContaining("Diese Channel existiert bereits."),
    });
  });
  it("should handle event with correct input", async () => {
    getSlackNameMock.mockResolvedValueOnce({ profile: { realName: "Bill Gates" } });
    slackConversationsListMock.mockResolvedValueOnce({ channels: [{ name: "Anderer_Testchannel" }] });
    slackUsersListMock.mockResolvedValueOnce({ members: [{ id: "1" }, { id: "2" }] });
    slackConversationsCreateMock.mockResolvedValueOnce({ channel: { id: 1337 } });

    await eventHandler({
      detail: {
        personId: ["1"],
        channelName: "Testchannel",
        responseUrl: "https://slack.com/response_url",
        messageTs: "1633540187.000600",
        channelId: "C02BBA8DWVD",
        actionId: "PRIVATE_CHANNEL",
      },
    } as any);

    expect(getSlackNameMock).toHaveBeenCalledWith("1");
    expect(slackConversationsCreateMock).toHaveBeenCalledWith("Testchannel");
    expect(slackConversationsInviteMock).toHaveBeenCalledWith(1337, "2");

    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringContaining("Bill Gates") && expect.stringContaining("Testchannel"),
    });
  });
  it("should handle event without channel name", async () => {
    getSlackNameMock.mockResolvedValueOnce({ profile: { realName: "Bill Gates" } });
    slackConversationsListMock.mockResolvedValueOnce({ channels: [{ name: "Anderer_Testchannel" }] });
    slackUsersListMock.mockResolvedValueOnce({ members: [{ id: "1" }, { id: "2" }] });
    slackConversationsCreateMock.mockResolvedValueOnce({ channel: { id: 1337 } });

    await eventHandler({
      detail: {
        personId: ["1"],
        channelName: null,
        responseUrl: "https://slack.com/response_url",
        messageTs: "1633540187.000600",
        channelId: "C02BBA8DWVD",
        actionId: "PRIVATE_CHANNEL",
      },
    } as any);

    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringContaining("Es wurde kein Channel erstellt, da kein Name angegeben wurde."),
    });
  });
  it("should handle event dot in channel name", async () => {
    getSlackNameMock.mockResolvedValueOnce({ profile: { realName: "Bill Gates" } });
    slackConversationsListMock.mockResolvedValueOnce({ channels: [{ name: "Anderer_Testchannel" }] });
    slackUsersListMock.mockResolvedValueOnce({ members: [{ id: "1" }, { id: "2" }] });
    slackConversationsCreateMock.mockResolvedValueOnce({ channel: { id: 1337 } });

    await eventHandler({
      detail: {
        personId: ["1"],
        channelName: "test.channel",
        responseUrl: "https://slack.com/response_url",
        messageTs: "1633540187.000600",
        channelId: "C02BBA8DWVD",
        actionId: "PRIVATE_CHANNEL",
      },
    } as any);

    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringContaining("Der Channel Name darf keinen Punkt enthalten."),
    });
  });

  it("should handle event with empty channel", async () => {
    getSlackNameMock.mockResolvedValue({ profile: { realName: "Bill Gates" } });
    slackConversationsListMock.mockResolvedValueOnce({ channels: [{ name: "Kanal" }] });
    slackUsersListMock.mockResolvedValueOnce({ members: [{ id: "1" }, { id: "2" }] });
    slackConversationsCreateMock.mockResolvedValueOnce({ channel: { id: 1337 } });

    await eventHandler({
      detail: {
        personId: ["1", "2"],
        channelName: "Neuer_Testchannel",
        responseUrl: "https://slack.com/response_url",
        messageTs: "1633540187.000600",
        channelId: "C02BBA8DWVD",
        actionId: "PRIVATE_CHANNEL",
      },
    } as any);

    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringContaining("Es wurde kein Channel erstellt, da er keine Mitglieder hätte"),
    });
  });
});
