export const GITLAB_TOKEN = process.env.GITLAB_TOKEN;

if (typeof GITLAB_TOKEN === "undefined") {
  throw new Error("Gitlab API key missing");
}
