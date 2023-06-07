import axios from "axios";
import { Issue, SprintIssues } from "./types/jira-types";
import { JIRA_USER_KWS, JIRA_PASSWORD_KWS } from "./credentials";

export async function getIssue(key: string): Promise<Issue | null> {
  const url = new URL("https://kwssaat.atlassian.net/rest/api/2/search");
  url.searchParams.append("jql", `issuekey= "${key}"`);

  const response = await axios.get<SprintIssues>(url.toString(), {
    auth: {
      username: JIRA_USER_KWS,
      password: JIRA_PASSWORD_KWS,
    },
  });
  const sprint = response.data;

  return sprint.issues && sprint.issues.length > 0 ? sprint.issues[0] : null;
}
