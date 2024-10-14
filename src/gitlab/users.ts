import axios from "axios";
import { GitlabUser } from "./gitlab";
import { GITLAB_TOKEN } from "./token";

export const getMembers = async (groupId: string): Promise<GitlabUser[]> => {
  const users = await axios.get(`https://gitlab.com/api/v4/groups/${groupId}/members/all`, {
    headers: {
      Authorization: `Bearer ${GITLAB_TOKEN}`,
    },
    params: {
      per_page: 100,
    },
  });
  return users.data;
};
