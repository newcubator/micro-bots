import axios from "axios";
import { GitlabProject } from "./gitlab";
import { GITLAB_TOKEN } from "./token";

export const getProject = async (projectId: string) => {
  return await axios.get<GitlabProject>(`https://gitlab.com/api/v4/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${GITLAB_TOKEN}`,
    },
  });
};
