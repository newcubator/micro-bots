import axios from 'axios';
import { MOCO_TOKEN } from './token';
import {MocoActivity, MocoActivityResponse} from "../types/moco-types";

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/activities.md
 */

export function getActivities(from: string, to: string, user_id: string) {
  return axios.get('https://newcubator.mocoapp.com/api/v1/activities', {
    headers: {
      'Authorization': "Token token=" + MOCO_TOKEN
    },
    params: {
      from,
      to,
      user_id
    },
  }) as Promise<MocoActivityResponse>
}

export function countHours(activities: MocoActivity[]): number {
  return activities
    .map(activity => activity.hours)
    .reduce((total: number, hours: number) => { return total + hours; });
}
