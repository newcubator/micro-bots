import { PrivateChannelRequestedEvent } from "../slack/interaction-handler";
import { EventBridgeEvent } from "aws-lambda";
import axios from "axios";
import {
  getRealSlackName,
  slackConversationsCreate,
  slackConversationsInvite,
  slackConversationsList,
  slackUsersList,
} from "../slack/slack";

export const eventHandler = async (event: EventBridgeEvent<string, PrivateChannelRequestedEvent>) => {
  console.log(`Handling event ${JSON.stringify(event.detail)}`);

  if (event.detail.channelName === null) {
    console.error("aborting because channel would have no name");
    await axios.post(event.detail.responseUrl, {
      replace_original: "true",
      text: `Es wurde kein Channel erstellt, da kein Name angegeben wurde.`,
    });
    return;
  }

  const excludedUsers = event.detail.personId;
  const excludedUsersNames = await Promise.all(
    excludedUsers.map((id) => getRealSlackName(id).then((user) => user.profile.real_name))
  );

  const channelName = event.detail.channelName;

  if (channelName.includes(".")) {
    await axios.post(event.detail.responseUrl, {
      replace_original: "true",
      text: `Der Channel Name darf keinen Punkt enthalten.`,
    });
    return;
  }

  console.info(`Trying to create channel ${channelName} without users ${excludedUsers}`);

  const channelsResponse = await slackConversationsList();
  if (channelsResponse.channels.map((c) => c.name).includes(channelName)) {
    console.error("aborting because channel already exists");
    await axios.post(event.detail.responseUrl, {
      replace_original: "true",
      text: `Diese Channel existiert bereits.`,
    });
    return;
  }

  const users = await slackUsersList();

  if (excludedUsers.some((user) => !users.members.map((m) => m.id).includes(user))) {
    console.error("aborting because a specified user was not found");
    await axios.post(event.detail.responseUrl, {
      replace_original: "true",
      text: `Mindestens einer der angegebenen User wurde nicht gefunden.`,
    });
    return;
  }

  let invites = users.members
    .filter((member) => member.id !== "USLACKBOT")
    .filter((member) => !member.deleted)
    .filter((member) => !member.is_bot)
    .filter((member) => !excludedUsers.includes(member.id))
    .map((member) => member.id);

  if (invites.length <= 0) {
    console.error("aborting because channel would have no members");
    await axios.post(event.detail.responseUrl, {
      replace_original: "true",
      text: `Es wurde kein Channel erstellt, da er keine Mitglieder hätte`,
    });
    return;
  }

  const channelResponse = await slackConversationsCreate(channelName);
  await slackConversationsInvite(channelResponse.channel.id, invites.join(","));

  console.log(
    await axios.post(event.detail.responseUrl, {
      replace_original: "true",
      text: `Der Channel ${channelName} ohne ${excludedUsersNames.join(", ")} erstellt!`,
    })
  );
};
