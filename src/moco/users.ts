import axios, { AxiosResponse } from 'axios';
import { SlackCommandType } from '../slack/types/slack-types';
import { MOCO_TOKEN } from './token';
import { MocoUserType } from './types/moco-types';

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/users.md
 */

export function getUsers(): Promise<Array<MocoUserType>> {
    return axios.get('https://newcubator.mocoapp.com/api/v1/users', {
        headers: {
            'Authorization': 'Token token=' + MOCO_TOKEN
        },
    }).then((response: AxiosResponse<Array<MocoUserType>>) => response.data);
}

export function findUserBySlackCommand(command: SlackCommandType): (users: Array<MocoUserType>) => MocoUserType {
    return (users: Array<MocoUserType>): MocoUserType => {
        let user: MocoUserType;
        user = findUserBySlackId(users, command.user_id);
        if (!user) {
            user = findUserByMailPrefix(users, command.user_name);
        }
        return user;
    };
}

function findUserBySlackId(users: Array<MocoUserType>, slackId: string): MocoUserType {
    return users.find(user => user.custom_properties.SlackId == slackId);
}

function findUserByMailPrefix(users: Array<MocoUserType>, prefix: string): MocoUserType {
    return users.find(user => user.email.startsWith(prefix));
}
