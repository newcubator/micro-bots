process.env.TZ = "Europe/Berlin";

process.env.AWS_LAMBDA_FUNCTION_NAME = "lambda-function-name";
process.env.AWS_REGION = "eu-newcubator-1";
process.env.EVENT_BUS = "test-event-bus";
process.env.SLACK_TOKEN = "not a real slack token";
process.env.MOCO_TOKEN = "not a real moco token";
process.env.GITLAB_TOKEN = "not a real gitlab token";
process.env.GITLAB_PROJECT = "1111111";
process.env.SLACK_CHANNEL = "1111111";
process.env.HOLIDAY_MAIL_REPLIES_CHANGE_SLACK_CHANNEL = "1111111";
process.env.GITLAB_BOOK_PROJECT_ID = "11111111";
process.env.GITLAB_NEWCUBATOR_GROUP_ID = "1234567";

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageReporters: ["text-summary", "html", "cobertura"],
};
