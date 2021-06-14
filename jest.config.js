process.env.SLACK_TOKEN = "i dont really need this token";

module.exports = {
  transform: {
    "^.+\\.tsx?$": "esbuild-jest"
  },
};
