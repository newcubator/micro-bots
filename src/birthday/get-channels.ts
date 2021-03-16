import { slack } from '../slack/slack';
import { ChannelListResponseType } from './types/birthday-bot-types';

export const getBirthdayChannels = async () => {
    const channelResponse = await slack.conversations.list({
        types: 'private_channel'
    }) as ChannelListResponseType;
    return channelResponse.channels.filter(channel => channel.name.startsWith('birthday-'));
};
