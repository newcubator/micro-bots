import axios, { AxiosResponse } from 'axios';
import { MOCO_TOKEN } from './token';
import { User } from './users';

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
  }).then((response: AxiosResponse<Array<Activity>>) => response.data);
}

export function countHours(activities: Array<Activity>): number {
  return activities
    .map(activity => activity.hours)
    .reduce((total: number, hours: number) => { return total + hours; });
}

export interface Activity {
  id: string;
  date: string;
  hours: number;
  description: string;
  billed: boolean;
  billable: boolean;
  tag: string;
  remote_service: string;
  remote_id: string;
  remote_url: string;
  project: {
    id: string;
    name: string;
    billable: boolean;
  },
  task: {
    id: string;
    name: string;
    billable: boolean
  },
  customer: {
    id: string;
    name: string;
  },
  user: {
    id: string;
    firstname: string;
    lastname: string;
  },
  hourly_rate: number;
  timer_started_at: string;
  created_at: string;
  updated_at: string;
}
