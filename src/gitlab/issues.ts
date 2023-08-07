import axios from "axios";
import FormData from "form-data";
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

export const createIssue = (
  projectId: string,
  title: string,
  description?: string,
  labels?: string[],
  due_date?: string,
): Promise<GitlabIssue> => {
  return axios
    .post(
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
      },
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const updateIssueDescription = (
  projectId: string,
  issueIid: number,
  description: string,
): Promise<GitlabIssue> => {
  return axios
    .put(
      `https://gitlab.com/api/v4/projects/${projectId}/issues/${issueIid}`,
      {
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${GITLAB_TOKEN}`,
        },
      },
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const uploadFile = (
  projectId: string,
  bytes: string,
  contentType: string,
  name: string,
): Promise<GitlabUpload> => {
  const form = new FormData();
  const buff = Buffer.from(bytes, "base64");
  form.append("file", buff, name);

  return axios
    .post(`https://gitlab.com/api/v4/projects/${projectId}/uploads`, form, {
      headers: {
        Authorization: `Bearer ${GITLAB_TOKEN}`,
        "content-type": "multipart/form-data",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export interface GitlabUpload {
  markdown: string;
}
