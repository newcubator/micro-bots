import { WebClient } from "@slack/web-api";
import {
  SlackChatPostMessageResponse,
  SlackConversationsCreateResponse,
  SlackConversationsInviteResponse,
  SlackConversationsListResponse,
  SlackConversationsMembersResponse,
  SlackUsersListResponse,
} from "./types/slack-types";

const SLACK_TOKEN = process.env.SLACK_TOKEN;

if (typeof SLACK_TOKEN === "undefined") {
  throw new Error("Slack token missing");
}

export const slack = new WebClient(SLACK_TOKEN);

export const slackConversationsList = async () => {
  return (await slack.conversations.list({
    types: "private_channel",
  })) as SlackConversationsListResponse;
};

export const slackConversationsCreate = async (channelName: string) => {
  return (await slack.conversations.create({
    name: channelName,
    is_private: true,
  })) as SlackConversationsCreateResponse;
};

export const slackConversationsArchive = async (channelId: string) => {
  return await slack.conversations.archive({
    channel: channelId,
  });
};

export const slackConversationsUnarchive = async (channelId: string) => {
  return await slack.conversations.unarchive({
    channel: channelId,
  });
};

export const slackConversationsMembers = async (channelId: string) => {
  return (await slack.conversations.members({
    channel: channelId,
  })) as SlackConversationsMembersResponse;
};

export const slackConversationsInvite = async (channelId: string, users: string) => {
  return (await slack.conversations.invite({
    channel: channelId,
    users: users,
  })) as SlackConversationsInviteResponse;
};

export const slackUsersList = async () => {
  return (await slack.users.list()) as SlackUsersListResponse;
};

export const slackChatPostMessage = async (text: string, channelId: string, username: string, icon_emoji: string) => {
  return (await slack.chat.postMessage({
    text: text,
    channel: channelId,
    username: username,
    icon_emoji: icon_emoji,
    link_names: true,
  })) as SlackChatPostMessageResponse;
};

export const slackUploadFileToChannel = async (channels, file, filename, initial_comment) => {
  console.log("Slack client", slack);
  return await slack.files.upload({
    channels,
    file,
    filename,
    initial_comment,
  });
};
