import { slackConversationsList } from '../slack/slack';

export const getBirthdayChannels = async () => {
    const channelResponse = await slackConversationsList();
    return channelResponse.channels.filter(channel => channel.name.startsWith('birthday-'));
};
