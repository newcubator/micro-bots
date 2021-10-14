import axios from "axios";
import { GitlabIssue } from "./gitlab";
import { GITLAB_TOKEN } from "./token";

export const getIssues = (projectId: string, search?: string, searchIn?: "title" | "description") => {
  return axios.get<GitlabIssue[]>(`https://gitlab.com/api/v4/projects/${projectId}/issues`, {
    headers: {
      Authorization: `Bearer ${GITLAB_TOKEN}`,
    },
    params: {
      search,
      in: searchIn,
    },
  });
};

export const postIssue = (
  projectId: string,
  title: string,
  description?: string,
  labels?: string[],
  due_date?: string
) => {
  return axios.post<GitlabIssue>(
    `https://gitlab.com/api/v4/projects/${projectId}/issues`,
    {
      title,
      description,
      labels,
      due_date,
    } as GitlabIssue,
    {
      headers: {
        Authorization: `Bearer ${GITLAB_TOKEN}`,
      },
    }
  );
};
