import axios from 'axios';
import { autoPage } from './auto-page';
import {MOCO_TOKEN} from './token';
import { MocoEmployment } from './types/moco-types';

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/planning_entries.md
 */

export async function getEmployments(from: string, to: string) {
  return autoPage<MocoEmployment>((page: number) => getEmploymentsPaged(from, to ,page));
}

const getEmploymentsPaged = (from: string, to: string, page: number) => axios.get('https://newcubator.mocoapp.com/api/v1/users/employments', {
  headers: {
    'Authorization': "Token token=" + MOCO_TOKEN
  },
  params: { from, to, page }
});

export function getUserEmployments(from: string, to: string, user_id: string) {
  return axios.get<MocoEmployment[]>('https://newcubator.mocoapp.com/api/v1/users/employments', {
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
