import axios from "axios";
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
