process.env.TZ = "Europe/Berlin";

process.env.SLACK_TOKEN = "not a real slack token";
process.env.MOCO_TOKEN = "not a real moco token";
process.env.GITLAB_TOKEN = "not a real gitlab token";
process.env.GITLAB_PROJECT = "1111111";
process.env.SLACK_CHANNEL = "1111111";
process.env.GENERAL_CHANNEL = "1111111";
process.env.VACATION_HANDOVER_CHANNEL_ID = "C0123456789";

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageReporters: ["text-summary", "html", "cobertura"],
};
