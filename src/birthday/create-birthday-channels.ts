import dayjs from 'dayjs';
import { slack } from '../slack/slack';
import { getBirthdayChannels } from './get-channels';
import {
    BirthdayType,
    ChannelMembersType,
    ChannelResponseType,
    ChannelType,
    MessageResponseType,
    UserResponseType
} from './types/birthday-bot-types';

const LEAD_TIME = process.env.LEAD_TIME;

export const createBirthdayChannels = async (birthdays: BirthdayType[]) => {
    if (birthdays.length === 0) {
        console.log(`No birthdays found to open a channel`);
        return null;
    }

    const channels = await getBirthdayChannels();
    for (const birthday of birthdays) {
        let channel: ChannelType;
        const channelName = `birthday-${birthday.firstname.toLowerCase()}`;
        const archivedChannel = channels.find(channel => channel.name === channelName && channel.is_archived === true);
        if (archivedChannel) {
            const channelResponse = await slack.conversations.unarchive({
                channel: archivedChannel.id
            }) as ChannelResponseType;
            channel = archivedChannel;
            console.debug(`Unarchived channel ${JSON.stringify(channelResponse)}`);
        } else {
            const channelResponse = await slack.conversations.create({
                name: channelName,
                is_private: true,
            }) as ChannelResponseType;
            channel = channelResponse.channel;
            console.debug(`Created channel ${JSON.stringify(channelResponse)}`);
        }

        const userResponse: UserResponseType = await slack.users.list() as UserResponseType;
        let invites = userResponse.members
            .filter((member) => member.id !== 'USLACKBOT')
            .filter((member) => !member.deleted)
            .filter((member) => !member.is_bot)
            .filter((member) => member.profile.email != birthday.email)
            .map((member) => member.id);

        if (archivedChannel) {
            const channelMembers = await slack.conversations.members({ channel: archivedChannel.id }) as ChannelMembersType;
            invites = invites.filter((id) => !channelMembers.members.includes(id));
        }

        if (invites.length > 0) {
            const inviteResponse: ChannelResponseType = await slack.conversations.invite({
                channel: channel.id,
                users: invites.join(','),
            }) as ChannelResponseType;
            console.debug(`Invited ${JSON.stringify(inviteResponse)}`);
        }

        const day = dayjs(birthday.birthday).locale('de').format('DD MMM');
        const messageResponse: MessageResponseType = await slack.chat.postMessage({
            text: `Hey Leute! ${birthday.firstname} hat in ${LEAD_TIME} Tagen am ${day} Geburtstag! Habt ihr euch bereits über eine kleine Überraschung Gedanken gemacht?`,
            channel: channel.id,
            username: 'Birthday Bot',
            icon_emoji: ':birthday:',
        }) as MessageResponseType;
        console.debug(`Wrote message ${JSON.stringify(messageResponse)}`);
    }
};
