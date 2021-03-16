import dayjs from 'dayjs';
import {
    slackChatPostMessage,
    slackConversationsCreate,
    slackConversationsInvite,
    slackConversationsMembers,
    slackConversationsUnarchive,
    slackUsersList
} from '../slack/slack';
import { Channel } from '../slack/types/slack-types';
import { getBirthdayChannels } from './get-channels';
import { BirthdayType } from './types/birthday-bot-types';

const LEAD_TIME = process.env.LEAD_TIME;

export const createBirthdayChannels = async (birthdays: BirthdayType[]) => {
    if (birthdays.length === 0) {
        console.log(`No birthdays found to open a channel`);
        return null;
    }

    const channels = await getBirthdayChannels();
    for (const birthday of birthdays) {
        let channel: Channel;
        const channelName = `birthday-${birthday.firstname.toLowerCase()}`;
        const archivedChannel = channels.find(channel => channel.name === channelName && channel.is_archived === true);
        if (archivedChannel) {
            const channelResponse = await slackConversationsUnarchive(archivedChannel.id);
            channel = archivedChannel;
            console.debug(`Unarchived channel ${JSON.stringify(channelResponse)}`);
        } else {
            const channelResponse = await slackConversationsCreate(channelName);
            channel = channelResponse.channel;
            console.debug(`Created channel ${JSON.stringify(channelResponse)}`);
        }

        const userResponse = await slackUsersList();
        let invites = userResponse.members
            .filter((member) => member.id !== 'USLACKBOT')
            .filter((member) => !member.deleted)
            .filter((member) => !member.is_bot)
            .filter((member) => member.profile.email != birthday.email)
            .map((member) => member.id);

        if (archivedChannel) {
            const channelMembers = await slackConversationsMembers(archivedChannel.id);
            invites = invites.filter((id) => !channelMembers.members.includes(id));
        }

        if (invites.length > 0) {
            const inviteResponse = await slackConversationsInvite(channel.id, invites.join(','));
            console.debug(`Invited ${JSON.stringify(inviteResponse)}`);
        }

        const day = dayjs(birthday.birthday).locale('de').format('DD MMM');
        const messageResponse = await slackChatPostMessage(
            `Hey Leute! ${birthday.firstname} hat in ${LEAD_TIME} Tagen am ${day} Geburtstag! Habt ihr euch bereits über eine kleine Überraschung Gedanken gemacht?`,
            channel.id,
            'Birthday Bot',
            ':birthday:',
        );
        console.debug(`Wrote message ${JSON.stringify(messageResponse)}`);
    }
};
