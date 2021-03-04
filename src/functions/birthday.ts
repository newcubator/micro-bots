import { WebClient } from '@slack/web-api';
import axios from 'axios';
import moment from 'moment';
import { BirthdayType, ChannelResponseType, MessageResponseType, UserResponseType } from '../birthday/types/birthday-bot-types';
import { MOCO_TOKEN } from '../moco/token';

const MOCO_URL = 'https://newcubator.mocoapp.com/api/v1/users';
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const LEAD_TIME = process.env.LEAD_TIME;

if (typeof SLACK_TOKEN === 'undefined') {
    throw new Error('Slack token missing');
}

const slack = new WebClient(SLACK_TOKEN);

module.exports.bot = async () => {
    const searchDate = moment().add(LEAD_TIME, 'days').format('MM-DD');
    console.log(`Searching for birthdays on the ${searchDate}`);

    const response = await axios.get(MOCO_URL, {
        headers: {
            Authorization: 'Token token=' + MOCO_TOKEN,
        },
    });
    const users = response.data;
    const birthdays: BirthdayType[] = users.filter(
        (user) => !!user.birthday && user.birthday.endsWith(searchDate)
    );
    for (const birthday of birthdays) {
        const channelName = `birthday-${birthday.firstname.toLowerCase()}`;
        const channelResponse: ChannelResponseType = await slack.conversations.create({
            name: channelName,
            is_private: true,
        }) as ChannelResponseType;
        console.debug(`Created channel ${JSON.stringify(channelResponse)}`);

        const userResponse: UserResponseType = await slack.users.list() as UserResponseType;
        const invites = userResponse.members
            .filter((member) => member.id !== 'USLACKBOT')
            .filter((member) => !member.deleted)
            .filter((member) => !member.is_bot)
            .filter((member) => member.profile.email != birthday.email)
            .map((member) => member.id)
            .join(',');

        const inviteResponse: ChannelResponseType = await slack.conversations.invite({
            channel: channelResponse.channel.id,
            users: invites,
        }) as ChannelResponseType;

        console.debug(`Invited ${JSON.stringify(inviteResponse)}`);

        const day = moment(birthday.birthday).format('DD MMM');
        const messageResonse: MessageResponseType = await slack.chat.postMessage({
            text: `Hey Leute ${birthday.firstname} hat in ${LEAD_TIME} Tagen am ${day} Geburtstag! Habt ihr euch bereits über eine kleine Überraschung Gedanken gemacht?`,
            channel: channelResponse.channel.id,
            username: 'Birthday Bot',
            icon_url:
                'https://gitlab.com/uploads/-/system/project/avatar/20934853/Birthday_Bot.png?width=64',
            icon_emoji: ':geburtstag:',
        }) as MessageResponseType;
        console.debug(`Wrote message ${JSON.stringify(messageResonse)}`);
    }
};
