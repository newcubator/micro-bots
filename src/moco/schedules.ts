import axios, { AxiosResponse } from 'axios';
import { MOCO_TOKEN } from './token';

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/schedules.md
 */

export function getSchedules(from: string, to: string, user_id: string) {
  return axios.get('https://newcubator.mocoapp.com/api/v1/schedules', {
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
