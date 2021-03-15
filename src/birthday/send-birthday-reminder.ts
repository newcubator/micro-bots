import { slackChatPostMessage } from '../slack/slack';
import { getBirthdayChannels } from './get-channels';
import { BirthdayType } from './types/birthday-bot-types';

export const sendBirthdayReminder = async (birthdays: BirthdayType[]) => {
    if (birthdays.length === 0) {
        console.log(`No birthdays found to send a reminder`);
        return null;
    }
    const channels = await getBirthdayChannels();
    for (const birthday of birthdays) {
        const channel = channels.find((channel) => channel.name.endsWith(birthday.firstname.toLowerCase()));
        if (channel) {
            const messageResponse = await slackChatPostMessage(
                `Hey Leute! ${birthday.firstname} hat heute Geburtstag! Ich hoffe ihr hab bereits das Geschenk bestellt! Denkt daran zu gratulieren!`,
                channel.id,
                'Birthday Bot',
                ':birthday:'
            );
            console.debug(`Wrote message ${JSON.stringify(messageResponse)}`);
        } else {
            console.debug(`Channel not found`);
        }
    }
};
