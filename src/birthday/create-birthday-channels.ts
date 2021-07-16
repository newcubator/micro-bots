import dayjs from "dayjs";
import {
  slackChatPostMessage,
  slackConversationsCreate,
  slackConversationsInvite,
  slackConversationsMembers,
  slackConversationsUnarchive,
  slackUsersList,
} from "../slack/slack";
import { Channel } from "../slack/types/slack-types";
import { getBirthdayChannels } from "./get-channels";
import { BirthdayType } from "./types/birthday-bot-types";

export const createBirthdayChannels = async (birthdays: BirthdayType[]) => {
  if (birthdays.length === 0) {
    console.log(`No birthdays found to open a channel`);
    return null;
  }

  const channels = await getBirthdayChannels();
  for (const birthday of birthdays) {
    const birthdayDate = dayjs(`${dayjs().year()}-${birthday.birthday.slice(5)}`);
    console.log(
      `Trying to open/unarchive channel for ${birthday.firstname} ${birthday.lastname} on ${birthdayDate.format(
        "YYYY-MM-DD"
      )}`
    );
    let channel: Channel;
    const channelName = `birthday-${birthday.firstname.toLowerCase()}`;

    const openedChannel = channels.find((channel) => channel.name === channelName && !channel.is_archived);
    if (openedChannel) {
      console.log(`Channel ${channelName} already opened`);
      continue;
    }

    const archivedChannel = channels.find((channel) => channel.name === channelName && channel.is_archived);
    if (archivedChannel) {
      const channelResponse = await slackConversationsUnarchive(archivedChannel.id);
      channel = archivedChannel;
      console.log(`Unarchived channel ${JSON.stringify(channelResponse)}`);
    } else {
      const channelResponse = await slackConversationsCreate(channelName);
      channel = channelResponse.channel;
      console.log(`Created channel ${JSON.stringify(channelResponse)}`);
    }

    const userResponse = await slackUsersList();
    let invites = userResponse.members
      .filter((member) => member.id !== "USLACKBOT")
      .filter((member) => !member.deleted)
      .filter((member) => !member.is_bot)
      .filter((member) => member.profile.email != birthday.email)
      .map((member) => member.id);

    if (archivedChannel) {
      const channelMembers = await slackConversationsMembers(archivedChannel.id);
      invites = invites.filter((id) => !channelMembers.members.includes(id));
    }

    if (invites.length > 0) {
      const inviteResponse = await slackConversationsInvite(channel.id, invites.join(","));
      console.log(`Invited ${JSON.stringify(inviteResponse)}`);
    }

    const messageResponse = await slackChatPostMessage(
      `Hey Leute! ${birthday.firstname} hat in ${Math.ceil(
        birthdayDate.diff(dayjs()) / 86400000
      )} Tagen am ${birthdayDate
        .locale("de")
        .format("DD MMM")} Geburtstag! Habt ihr euch bereits über eine kleine Überraschung Gedanken gemacht?`,
      channel.id,
      "Birthday Bot",
      ":birthday:"
    );
    console.log(`Wrote message ${JSON.stringify(messageResponse)}`);
  }
};
