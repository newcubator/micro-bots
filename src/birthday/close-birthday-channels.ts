import { slackConversationsArchive } from '../slack/slack';
import { getBirthdayChannels } from './get-channels';
import { BirthdayType } from './types/birthday-bot-types';

export const closeBirthdayChannels = async (birthdays: BirthdayType[]) => {
    if (birthdays.length === 0) {
        console.log('No birthdays found to close channel');
        return null;
    }
    const channels = await getBirthdayChannels();
    for (const birthday of birthdays) {
        const channel = channels.find((channel) => channel.name.endsWith(birthday.firstname.toLowerCase()));
        if (channel) {
            const archiveResponse = await slackConversationsArchive(channel.id);
            console.debug(`Archived channel ${JSON.stringify(archiveResponse)}`);
        }
    }
}
