process.env.TZ = "Europe/Berlin";

process.env.AWS_LAMBDA_FUNCTION_NAME = "lambda-function-name";
process.env.AWS_REGION = "eu-newcubator-1";
process.env.EVENT_BUS = "test-event-bus";
process.env.SLACK_TOKEN = "not a real slack token";
process.env.MOCO_TOKEN = "not a real moco token";
process.env.GITLAB_TOKEN = "not a real gitlab token";
process.env.GITLAB_PROJECT = 1111111;
process.env.SLACK_CHANNEL = 1111111;
process.env.GITLAB_BOOK_PROJECT_ID = 11111111;

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageReporters: ["text-summary", "html", "cobertura"],
  coverageThreshold: {
    global: {
      statements: 85.8,
      branches: 71.8,
      functions: 64.0,
      lines: 84.8,
    },
  },
};
