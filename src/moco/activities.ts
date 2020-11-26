import axios from 'axios';
import {MOCO_TOKEN} from './token';
import {MocoActivityResponse} from "../types/moco-types";

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/activities.md
 */

export async function getActivities(from: string, to: string) {
  let page = 1
  let response: MocoActivityResponse
  let fullResponse: MocoActivityResponse = {data: []} as MocoActivityResponse
  do {
    response = await getActivitiesRekursiv(from, to, page)
    fullResponse.data.push(...response.data)
    page++;
  } while (response.headers.link?.includes('rel="next"'))
  return fullResponse
}

export function getActivitiesRekursiv(from: string, to: string, page?: number) {
  return axios.get('https://newcubator.mocoapp.com/api/v1/activities', {
    headers: {
      'Authorization': "Token token=" + MOCO_TOKEN
    },
    params: {
      from,
      to,
      page
    },
  }) as Promise<MocoActivityResponse>
}

export function getUserActivities(from: string, to: string, user_id: string) {
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
