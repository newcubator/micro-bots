import axios from "axios";
import { GitlabIssueTemplate } from "./gitlab";
import { GITLAB_TOKEN } from "./token";

export async function getIssueTemplateByName(projectId: string, name: string): Promise<GitlabIssueTemplate> {
  return axios
    .get(`https://gitlab.com/api/v4/projects/${projectId}/templates/issues/${name}`, {
      headers: {
        Authorization: `Bearer ${GITLAB_TOKEN}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(`Error while loading gitlab issue template ${projectId} ${name}`);
      throw error;
    });
}
