import axios, { AxiosResponse } from 'axios';
import { Command } from '../slack/command';
import { MOCO_TOKEN } from './token';

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/users.md
 */

export function getUsers(): Promise<Array<User>> {
  return axios.get('https://newcubator.mocoapp.com/api/v1/users', {
    headers: {
      'Authorization': "Token token=" + MOCO_TOKEN
    },
  }).then((response: AxiosResponse<Array<User>>) => response.data);
}

export function findUserBySlackCommand(command: Command): (users: Array<User>) => User {
  return (users: Array<User>): User => {
    let user: User;
    user = findUserBySlackId(users, command.user_id);
    if (!user) {
      user = findUserByMailPrefix(users, command.user_name);
    }
    return user;
  }
}

function findUserBySlackId(users: Array<User>, slackId: string): User {
  return users.find(user => user.custom_properties.SlackId == slackId);
}

function findUserByMailPrefix(users: Array<User>, prefix: string): User {
  return users.find(user => user.email.startsWith(prefix));
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  active: boolean;
  external: boolean;
  email: string;
  mobile_phone: string;
  work_phone: string;
  home_address: string;
  info: string;
  birthday: string;
  avatar_url: string;
  custom_properties: any;
  unit: any;
  created_at: string;
  updated_at: string;
}
