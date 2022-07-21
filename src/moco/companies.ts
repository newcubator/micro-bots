import axios from "axios";
import { MOCO_TOKEN } from "./token";
import { MocoCompany } from "./types/moco-types";

export async function getCompanyById(id: string) {
  return axios
    .get<MocoCompany>(`https://newcubator.mocoapp.com/api/v1/companies/${id}`, {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
    })
    .then((response) => response.data);
}
