import { closeBirthdayChannels } from "../birthday/close-birthday-channels";
import { createBirthdayChannels } from "../birthday/create-birthday-channels";
import { getBirthdayChannels } from "../birthday/get-channels";
import { sendBirthdayReminder } from "../birthday/send-birthday-reminder";
import { EXAMPLE_BIRTHDAY_JANE, EXAMPLE_BIRTHDAY_JOHN } from "../birthday/types/birthday-bot-types";
import * as slack from "../slack/slack";
import {
  EXAMPLE_CHANNEL_BIRTHDAY_JANE,
  EXAMPLE_SLACK_CHAT_POST_MESSAGE_RESPONSE,
  EXAMPLE_SLACK_CONVERSATIONS_CREATE_RESPONSE,
  EXAMPLE_SLACK_CONVERSATIONS_INVITE_RESPONSE,
  EXAMPLE_SLACK_CONVERSATIONS_LIST_RESPONSE,
  EXAMPLE_SLACK_CONVERSATIONS_MEMBERS_RESPONSE,
  EXAMPLE_SLACK_USERS_LIST_RESPONSE,
} from "../slack/types/slack-types";

describe("birthday", () => {
  const mockedSlackConversationsList = jest
    .spyOn(slack, "slackConversationsList")
    .mockResolvedValue(EXAMPLE_SLACK_CONVERSATIONS_LIST_RESPONSE);
  const mockedSlackConversationsCreate = jest
    .spyOn(slack, "slackConversationsCreate")
    .mockResolvedValue(EXAMPLE_SLACK_CONVERSATIONS_CREATE_RESPONSE);
  const mockedSlackConversationsArchive = jest
    .spyOn(slack, "slackConversationsArchive")
    .mockResolvedValue({ ok: true });
  const mockedSlackConversationsUnarchive = jest
    .spyOn(slack, "slackConversationsUnarchive")
    .mockResolvedValue({ ok: true });
  const mockedSlackConversationsMembers = jest
    .spyOn(slack, "slackConversationsMembers")
    .mockResolvedValue(EXAMPLE_SLACK_CONVERSATIONS_MEMBERS_RESPONSE);
  const mockedSlackConversationsInvite = jest
    .spyOn(slack, "slackConversationsInvite")
    .mockResolvedValue(EXAMPLE_SLACK_CONVERSATIONS_INVITE_RESPONSE);
  const mockedSlackUsersList = jest.spyOn(slack, "getSlackUsers").mockResolvedValue(EXAMPLE_SLACK_USERS_LIST_RESPONSE);
  const mockedSlackChatPostMessage = jest
    .spyOn(slack, "slackChatPostMessage")
    .mockResolvedValue(EXAMPLE_SLACK_CHAT_POST_MESSAGE_RESPONSE);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return only one channel", async () => {
    expect((await getBirthdayChannels()).length).toEqual(1);
  });

  it("should create a new channel", async () => {
    const BIRTHDAY_JOHN = {
      ...EXAMPLE_SLACK_CONVERSATIONS_CREATE_RESPONSE,
      channel: {
        ...EXAMPLE_CHANNEL_BIRTHDAY_JANE,
        name: "birthday-john",
      },
    };
    mockedSlackConversationsCreate.mockResolvedValue(BIRTHDAY_JOHN);
    mockedSlackConversationsInvite.mockResolvedValue(BIRTHDAY_JOHN);

    await createBirthdayChannels([EXAMPLE_BIRTHDAY_JOHN]);

    expect(mockedSlackConversationsList.mock.instances.length).toEqual(1);
    expect(mockedSlackConversationsUnarchive.mock.instances.length).toEqual(0);
    expect(mockedSlackConversationsCreate.mock.instances.length).toEqual(1);
    expect(mockedSlackUsersList.mock.instances.length).toEqual(1);
    expect(mockedSlackConversationsMembers.mock.instances.length).toEqual(0);
    expect(mockedSlackConversationsInvite.mock.instances.length).toEqual(1);
    expect(mockedSlackChatPostMessage.mock.instances.length).toEqual(1);
  });

  it("should unarchive an existing channel", async () => {
    await createBirthdayChannels([EXAMPLE_BIRTHDAY_JANE]);

    expect(mockedSlackConversationsList.mock.instances.length).toEqual(1);
    expect(mockedSlackConversationsCreate.mock.instances.length).toEqual(0);
    expect(mockedSlackConversationsUnarchive.mock.instances.length).toEqual(1);
    expect(mockedSlackUsersList.mock.instances.length).toEqual(1);
    expect(mockedSlackConversationsMembers.mock.instances.length).toEqual(1);
    expect(mockedSlackConversationsInvite.mock.instances.length).toEqual(0);
    expect(mockedSlackChatPostMessage.mock.instances.length).toEqual(1);
  });

  it("should neither create nor unarchive a channel", async () => {
    await createBirthdayChannels([]);

    expect(mockedSlackConversationsList.mock.instances.length).toEqual(0);
    expect(mockedSlackConversationsCreate.mock.instances.length).toEqual(0);
    expect(mockedSlackConversationsUnarchive.mock.instances.length).toEqual(0);
    expect(mockedSlackUsersList.mock.instances.length).toEqual(0);
    expect(mockedSlackConversationsMembers.mock.instances.length).toEqual(0);
    expect(mockedSlackConversationsInvite.mock.instances.length).toEqual(0);
    expect(mockedSlackChatPostMessage.mock.instances.length).toEqual(0);
  });

  it("should send a reminder to a channel", async () => {
    mockedSlackConversationsList.mockResolvedValue({
      ...EXAMPLE_SLACK_CONVERSATIONS_LIST_RESPONSE,
      channels: [
        {
          ...EXAMPLE_CHANNEL_BIRTHDAY_JANE,
          is_archived: false,
        },
      ],
    });

    await sendBirthdayReminder([EXAMPLE_BIRTHDAY_JANE]);

    expect(mockedSlackConversationsList.mock.instances.length).toEqual(1);
    expect(mockedSlackChatPostMessage.mock.instances.length).toEqual(1);
  });

  it("should not send a reminder to a channel", async () => {
    await sendBirthdayReminder([]);

    expect(mockedSlackConversationsList.mock.instances.length).toEqual(0);
    expect(mockedSlackChatPostMessage.mock.instances.length).toEqual(0);
  });

  it("should archive a channel", async () => {
    mockedSlackConversationsList.mockResolvedValue({
      ...EXAMPLE_SLACK_CONVERSATIONS_LIST_RESPONSE,
      channels: [
        {
          ...EXAMPLE_CHANNEL_BIRTHDAY_JANE,
          is_archived: false,
        },
      ],
    });

    await closeBirthdayChannels([EXAMPLE_BIRTHDAY_JANE]);

    expect(mockedSlackConversationsList.mock.instances.length).toEqual(1);
    expect(mockedSlackConversationsArchive.mock.instances.length).toEqual(1);
  });

  it("should not archive a channel", async () => {
    mockedSlackConversationsList.mockResolvedValue({
      ...EXAMPLE_SLACK_CONVERSATIONS_LIST_RESPONSE,
      channels: [
        {
          ...EXAMPLE_CHANNEL_BIRTHDAY_JANE,
          is_archived: false,
        },
      ],
    });

    await closeBirthdayChannels([]);

    expect(mockedSlackConversationsList.mock.instances.length).toEqual(0);
    expect(mockedSlackConversationsArchive.mock.instances.length).toEqual(0);
  });
});
