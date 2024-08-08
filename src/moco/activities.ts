import axios from "axios";
import { autoPage } from "./auto-page";
import { MOCO_TOKEN } from "./token";
import { MocoActivity } from "./types/moco-types";
import { AxiosResponse } from "axios";

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/activities.md
 */

export async function getActivities(from: string, to: string, projectId: string = undefined) {
  return autoPage<MocoActivity[]>((page: number) => getActivitiesPaged(from, to, page, projectId));
}

const getActivitiesPaged = (from: string, to: string, page: number, projectId: string) => {
  return axios
    .get<MocoActivity[]>("https://newcubator.mocoapp.com/api/v1/activities", {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
      params: { from, to, page, project_id: projectId },
    })
    .then((response: AxiosResponse<MocoActivity[]>) => {
      console.log(`Loaded activities for project ${projectId} from ${from} to ${to} page ${page}`);
      return response;
    })
    .catch((error) => {
      console.error("Error while loading moco activities!");
      throw error;
    });
};

export function getUserActivities(from: Date, to: Date, user_id: string) {
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
