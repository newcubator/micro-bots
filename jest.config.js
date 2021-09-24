process.env.AWS_LAMBDA_FUNCTION_NAME = "lambda-function-name";
process.env.AWS_REGION = "eu-newcubator-1";
process.env.EVENT_BUS = "test-event-bus";
process.env.SLACK_TOKEN = "not a real slack token";
process.env.MOCO_TOKEN = "not a real moco token";

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
};
