import { slackConversationsArchive } from "../slack/slack";
import { getBirthdayChannels } from "./get-channels";
import { BirthdayType } from "./types/birthday-bot-types";

export const closeBirthdayChannels = async (birthdays: BirthdayType[]) => {
  if (birthdays.length === 0) {
    console.log("No birthdays found to close channel");
    return null;
  }

  const channels = await getBirthdayChannels();
  for (const birthday of birthdays) {
    console.log(
      `Trying to close channel for ${birthday.firstname} ${birthday.lastname} on ${birthday.birthday.slice(5)}`
    );
    const channel = channels.find(
      (channel) =>
        channel.name.endsWith(`${birthday.firstname.toLowerCase()}-${birthday.lastname.toLowerCase()}`) &&
        !channel.is_archived
    );
    if (channel) {
      const archiveResponse = await slackConversationsArchive(channel.id);
      console.log(`Archived channel ${JSON.stringify(archiveResponse)}`);
    } else {
      console.log(`Channel birthday-${birthday.firstname.toLowerCase()} already archived`);
    }
  }
};
