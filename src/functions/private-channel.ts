import { APIGatewayEvent } from 'aws-lambda';
import { decode } from 'querystring';
import { slackConversationsCreate, slackConversationsInvite, slackConversationsList, slackUsersList } from '../slack/slack';
import { SlackCommandType } from '../slack/types/slack-types';

export const handler = async (event: APIGatewayEvent) => {
    const command: SlackCommandType = decode(event.body) as SlackCommandType;

    const excludedUsers = command.text.split('@').map(str => str.trim());
    const channelName = excludedUsers.shift().trim();

    const channelsResponse = await slackConversationsList();
    if (channelsResponse.channels.map(c => c.name).includes(channelName)) {
        return {
            response_type: 'ephemeral',
            text: 'Es existiert bereits ein Channel mit diesem Namen.'
        };
    }

    const users = await slackUsersList();

    if (excludedUsers.some(user => !users.members.map(m => m.name).includes(user))) {
        return {
            response_type: 'ephemeral',
            text: 'Mindestens einer der angegebenen User wurde nicht gefunden'
        };
    }

    let invites = users.members
        .filter((member) => member.id !== 'USLACKBOT')
        .filter((member) => !member.deleted)
        .filter((member) => !member.is_bot)
        .filter((member) => !excludedUsers.includes(member.name))
        .map((member) => member.id);

    if (invites.length <= 0) {
        return {
            response_type: 'ephemeral',
            text: 'Es wurde kein Channel erstellt, da er keine Mitglieder hätte'
        };
    }

    const channelResponse = await slackConversationsCreate(channelName);
    await slackConversationsInvite(channelResponse.channel.id, invites.join(','));

    return {
        statusCode: 200,
        body: `Ich habe den Channel "${channelName}" ohne ${excludedUsers.join(', ')} erstellt.`,
    };
};
