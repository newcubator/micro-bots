import { APIGatewayEvent } from "aws-lambda";
import { decode } from "querystring";
import {
  slackConversationsCreate,
  slackConversationsInvite,
  slackConversationsList,
  slackUsersList,
} from "../slack/slack";
import { SlackCommandType } from "../slack/types/slack-types";

export const handler = async (event: APIGatewayEvent) => {
  const command: SlackCommandType = decode(event.body) as SlackCommandType;

  const excludedUsers = command.text.split("@").map((str) => str.trim());
  const channelName = excludedUsers.shift().trim();

  console.info(`Trying to create channel ${channelName} without users ${excludedUsers}`);

  const channelsResponse = await slackConversationsList();
  if (channelsResponse.channels.map((c) => c.name).includes(channelName)) {
    console.error("aborting because channel already exists");
    return {
      response_type: "ephemeral",
      text: "Es existiert bereits ein Channel mit diesem Namen.",
    };
  }

  const users = await slackUsersList();

  if (excludedUsers.some((user) => !users.members.map((m) => m.name).includes(user))) {
    console.error("aborting because a specified user was not found");
    return {
      response_type: "ephemeral",
      text: "Mindestens einer der angegebenen User wurde nicht gefunden",
    };
  }

  let invites = users.members
    .filter((member) => member.id !== "USLACKBOT")
    .filter((member) => !member.deleted)
    .filter((member) => !member.is_bot)
    .filter((member) => !excludedUsers.includes(member.name))
    .map((member) => member.id);

  if (invites.length <= 0) {
    console.error("aborting because channel would have no members");
    return {
      response_type: "ephemeral",
      text: "Es wurde kein Channel erstellt, da er keine Mitglieder hätte",
    };
  }

  const channelResponse = await slackConversationsCreate(channelName);
  await slackConversationsInvite(channelResponse.channel.id, invites.join(","));

  console.info(`Success: channel ${channelName} was created`);
  return {
    statusCode: 200,
    body: `Ich habe den Channel "${channelName}" ohne ${excludedUsers.join(", ")} erstellt.`,
  };
};
