export const JIRA_PASSWORD_KWS = process.env.JIRA_PASSWORD_KWS;
export const JIRA_USER_KWS = process.env.JIRA_USER_KWS;

if (typeof JIRA_PASSWORD_KWS === "undefined") {
  throw new Error("JIRA_PASSWORD_KWS missing");
}
if (typeof JIRA_USER_KWS === "undefined") {
  throw new Error("JIRA_USER_KWS missing");
}
