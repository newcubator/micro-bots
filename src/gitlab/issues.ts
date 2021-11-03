import axios from "axios";
import { GitlabIssue } from "./gitlab";
import { GITLAB_TOKEN } from "./token";

export const getIssues = (projectId: string, params: GetDealsParams = {}) => {
  return axios.get<GitlabIssue[]>(`https://gitlab.com/api/v4/projects/${projectId}/issues`, {
    headers: {
      Authorization: `Bearer ${GITLAB_TOKEN}`,
    },
    params,
  });
};

export interface GetDealsParams {
  due_date?: "week";
  in?: "title" | "description";
  search?: string;
  state?: "all" | "opened" | "closed";
}

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
