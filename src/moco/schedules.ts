import axios from 'axios';
import {MOCO_TOKEN} from './token';
import {MocoSchedulesResponse} from "../types/moco-types";

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/schedules.md
 */

export async function getSchedules(from: string, to: string) {
  let page = 1
  let response: MocoSchedulesResponse
  let fullResponse: MocoSchedulesResponse = {data: []} as MocoSchedulesResponse
  do {
    response = await getSchedulesRekursiv(from, to, page)
    fullResponse.data.push(...response.data)
    page++;
  } while (response.headers.link?.includes('rel="next"'))
  return fullResponse
}

export function getSchedulesRekursiv(from: string, to: string, page: number) {
  return axios.get('https://newcubator.mocoapp.com/api/v1/schedules', {
    headers: {
      'Authorization': "Token token=" + MOCO_TOKEN
    },
    params: {
      from,
      to,
      page
    }
  }) as Promise<MocoSchedulesResponse>
}

export function getUserSchedules(from: string, to: string, user_id: string) {
  return axios.get('https://newcubator.mocoapp.com/api/v1/schedules', {
    headers: {
      'Authorization': "Token token=" + MOCO_TOKEN
    },
    params: {
      from,
      to,
      user_id
    },
  }) as Promise<MocoSchedulesResponse>;
}
