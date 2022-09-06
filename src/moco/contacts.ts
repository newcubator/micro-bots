import axios from "axios";
import { autoPage } from "./auto-page";
import { MOCO_TOKEN } from "./token";
import { MocoContact } from "./types/moco-types";

export async function getContactById(id: string) {
  return axios
    .get<MocoContact>(`https://newcubator.mocoapp.com/api/v1/contacts/people/${id}`, {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
    })
    .then((response) => response.data);
}

export async function getContacts() {
  return axios
    .get<MocoContact[]>(`https://newcubator.mocoapp.com/api/v1/contacts/people/`, {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
    })
    .then((response) => response.data);
}

const getContactsPaged = (page: number) =>
  axios.get<any>(`https://newcubator.mocoapp.com/api/v1/contacts/people/`, {
    headers: {
      Authorization: "Token token=" + MOCO_TOKEN,
    },
    params: { page },
  });

export async function getAllContacts() {
  return autoPage<MocoContact>((page: number) => getContactsPaged(page));
}
