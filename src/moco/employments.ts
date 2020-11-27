import axios from 'axios';
import {MOCO_TOKEN} from './token';
import {MocoEmploymentsResponse} from "../types/moco-types";

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/planning_entries.md
 */

export async function getEmployments(from: string, to: string) {
  let page = 1
  let response: MocoEmploymentsResponse
  let fullResponse: MocoEmploymentsResponse = {data: []} as MocoEmploymentsResponse
  do {
    response = await getEmploymentsRekursiv(from, to, page)
    fullResponse.data.push(...response.data)
    page++;
  } while (response.headers.link?.includes('rel="next"'))
  return fullResponse
}

export function getEmploymentsRekursiv(from: string, to: string, page: number) {
  return axios.get('https://newcubator.mocoapp.com/api/v1/users/employments', {
    headers: {
      'Authorization': "Token token=" + MOCO_TOKEN
    },
    params: {
      from,
      to,
      page
    }
  }) as Promise<MocoEmploymentsResponse>
}

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
  }) as Promise<MocoEmploymentsResponse>
}
