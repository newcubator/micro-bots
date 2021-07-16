import { slackChatPostMessage } from "../slack/slack";
import { getBirthdayChannels } from "./get-channels";
import { BirthdayType } from "./types/birthday-bot-types";

export const sendBirthdayReminder = async (birthdays: BirthdayType[]) => {
  if (birthdays.length === 0) {
    console.log(`No birthdays found to send a reminder`);
    return null;
  }
  const channels = await getBirthdayChannels();
  for (const birthday of birthdays) {
    console.log(
      `Trying to send reminder for ${birthday.firstname} ${birthday.lastname} on ${birthday.birthday.slice(5)}`
    );
    const channel = channels.find((channel) => channel.name.endsWith(birthday.firstname.toLowerCase()));
    if (channel) {
      const messageResponse = await slackChatPostMessage(
        `Hey Leute! ${birthday.firstname} hat heute Geburtstag! Ich hoffe ihr hab bereits das Geschenk bestellt! Denkt daran zu gratulieren!`,
        channel.id,
        "Birthday Bot",
        ":birthday:"
      );
      console.log(`Wrote message ${JSON.stringify(messageResponse)}`);
    } else {
      console.warn(`Channel not found`);
    }
  }
};
