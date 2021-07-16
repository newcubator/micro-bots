import axios from "axios";
import { autoPage } from "./auto-page";
import { MOCO_TOKEN } from "./token";
import { MocoContract, MocoProject } from "./types/moco-types";

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/projects.md
 */

export async function getProjects() {
  return autoPage<MocoProject>((page: number) => getProjectsPaged(page));
}

const getProjectsPaged = (page) =>
  axios.get<MocoProject>("https://newcubator.mocoapp.com/api/v1/projects", {
    headers: {
      Authorization: "Token token=" + MOCO_TOKEN,
    },
    params: { include_archived: true, page },
  });

export async function getProject(id: string) {
  return axios
    .get<MocoProject>(`https://newcubator.mocoapp.com/api/v1/projects/${id}`, {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
    })
    .then((response) => {
      console.log(response.data);
      return response.data;
    });
}

export async function putProjectContract(projectId: string, contract: MocoContract) {
  return axios
    .put<MocoContract>(
      `https://newcubator.mocoapp.com/api/v1/projects/${projectId}/contracts/${contract.id}`,
      contract,
      {
        headers: {
          Authorization: "Token token=" + MOCO_TOKEN,
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      return response.data;
    });
}
