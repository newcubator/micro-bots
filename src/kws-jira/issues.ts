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

export async function getIssues(keys: string[], maxResults = 100): Promise<Issue[]> {
  const jql = `key in (${keys.join(",")})`;
  let startAt = 0;
  let allIssues: Issue[] = [];
  let issues: Issue[] = [];

  do {
    const url = new URL("https://kwssaat.atlassian.net/rest/api/2/search");
    url.searchParams.append("jql", jql);
    url.searchParams.append("startAt", String(startAt));
    url.searchParams.append("maxResults", String(maxResults));
    url.searchParams.append(
      "fields",
      "issuetype,created,description,summary,customfield_10027,customfield_10089,customfield_10010,timeestimate,timetracking",
    );

    const response = await axios.get<SprintIssues>(url.toString(), {
      auth: {
        username: JIRA_USER_KWS,
        password: JIRA_PASSWORD_KWS,
      },
    });

    const sprint = response.data;
    issues = sprint.issues || [];

    allIssues = [...allIssues, ...issues];

    startAt += maxResults;
  } while (issues.length === maxResults);

  return allIssues;
}
