import axios, { AxiosResponse } from 'axios';
import { MOCO_TOKEN } from './token';

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/planning_entries.md
 */

export function getUserEmployments(from: string, to: string, user_id: string) {
  return axios.get('https://newcubator.mocoapp.com/api/v1/users/employments', {
    headers: {
      'Authorization': "Token token=" + MOCO_TOKEN
    },
    params: {
      from,
      to,
      user_id
    },
  });
}
