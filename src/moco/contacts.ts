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

export async function findContactByEmail(email: string) {
  return axios
    .get<MocoContact[]>(`https://newcubator.mocoapp.com/api/v1/contacts/people`, {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
      params: { term: email },
    })
    .then((response) => response.data.find((contact) => contact.work_email?.toLowerCase() === email.toLowerCase()));
}

export async function createContact(contact: {
  firstname: string;
  lastname: string;
  gender: "U";
  work_email: string;
  work_phone?: string;
  info?: string;
}) {
  return axios
    .post<MocoContact>(`https://newcubator.mocoapp.com/api/v1/contacts/people`, contact, {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
        "Content-Type": "application/json",
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
