import axios, { AxiosResponse } from "axios";
import { MOCO_TOKEN } from "./token";
import { MocoCompany } from "./types/moco-types";

export function getCompanies(): Promise<Array<MocoCompany>> {
  return axios
    .get("https://newcubator.mocoapp.com/api/v1/companies", {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
    })
    .then((response: AxiosResponse<Array<MocoCompany>>) => {
      console.info(`Loaded ${response.data.length} companies`);
      return response.data;
    })
    .catch((error) => {
      console.error("Error while loading moco companies!");
      throw error;
    });
}

export async function getCompanyById(id: string) {
  return axios
    .get<MocoCompany>(`https://newcubator.mocoapp.com/api/v1/companies/${id}`, {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
    })
    .then((response) => response.data);
}
