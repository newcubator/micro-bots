import axios from "axios";
import { autoPage } from "./auto-page";
import { MOCO_TOKEN } from "./token";
import { MocoActivity } from "./types/moco-types";

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/activities.md
 */

export async function getActivities(from: string, to: string) {
  return autoPage<MocoActivity>((page: number) => getActivitiesPaged(from, to, page));
}

const getActivitiesPaged = (from, to, page) =>
  axios.get<MocoActivity>("https://newcubator.mocoapp.com/api/v1/activities", {
    headers: {
      Authorization: "Token token=" + MOCO_TOKEN,
    },
    params: { from, to, page },
  });

export function getUserActivities(from: string, to: string, user_id: string) {
  return axios.get<MocoActivity[]>("https://newcubator.mocoapp.com/api/v1/activities", {
    headers: {
      Authorization: "Token token=" + MOCO_TOKEN,
    },
    params: {
      from,
      to,
      user_id,
    },
  });
}
