import axios from "axios";
import { autoPage } from "./auto-page";
import { MOCO_TOKEN } from "./token";
import { MocoSchedule } from "./types/moco-types";

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/schedules.md
 */

export async function getSchedules(from: string, to: string, absence_code?: number) {
  return autoPage<MocoSchedule>((page: number) => getSchedulesPaged(from, to, page, absence_code));
}

const getSchedulesPaged = (from: string, to: string, page: number, absence_code?: number) =>
  axios.get<any>("https://newcubator.mocoapp.com/api/v1/schedules", {
    headers: {
      Authorization: "Token token=" + MOCO_TOKEN,
    },
    params: { from, to, page, absence_code },
  });

export function getUserSchedules(from: string, to: string, user_id: string, absence_code?: number) {
  return axios.get<MocoSchedule[]>("https://newcubator.mocoapp.com/api/v1/schedules", {
    headers: {
      Authorization: "Token token=" + MOCO_TOKEN,
    },
    params: {
      from,
      to,
      user_id,
      absence_code,
    },
  });
}

export function createMultipleUserSchedules(from: Date, to: Date, user_id: string, absence_code: number, am: boolean, pm: boolean, comment: string, symbole: number, overwrite: boolean) {
    let dates = [];
    while (from <= to) {
      dates.push(from);
      from.setDate(from.getDate() + 1);
    }
    return Promise.all(dates.map(date => {
      return createUserSchedule(date.toISOString().split('T')[0], user_id, absence_code, am, pm, comment, symbole, overwrite);
    })

  );
}

export function createUserSchedule(date: string, user_id: string, absence_code: number, am: boolean, pm: boolean, comment: string, symbole: number, overwrite: boolean) {
  return axios.post<MocoSchedule[]>(
    "https://newcubator.mocoapp.com/api/v1/schedules",
    {
      date,
      absence_code,
      user_id,
      am,
      pm,
      comment,
      symbole,
      overwrite
    },
    {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
    },
  );
}
