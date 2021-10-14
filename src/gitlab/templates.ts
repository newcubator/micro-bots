import axios from 'axios';
import { GitlabIssueTemplate } from './gitlab';
import { GITLAB_TOKEN } from './token';

export const getIssueTemplateByName = async (projectId: string, name: string) => {
  return await axios.get<GitlabIssueTemplate>(encodeURI(`https://gitlab.com/api/v4/projects/${projectId}/templates/issues/${name}`), {
    headers: {
      Authorization: `Bearer ${GITLAB_TOKEN}`,
    },
  });
};
