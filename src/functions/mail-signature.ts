import { APIGatewayEvent } from "aws-lambda";
import { decode } from "querystring";
import { SlackCommandType } from "../slack/types/slack-types";

export const handler = async (event: APIGatewayEvent) => {
  const command: SlackCommandType = decode(event.body) as SlackCommandType;

  const responseBody = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Du kannst deine Mail Signatur unter https://kceiclszhf.execute-api.eu-central-1.amazonaws.com/production/mailSignatureGenerator?user_id=${command.user_id}&user_name=${command.user_name} abrufen.`,
        },
      },
    ],
  };

  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  };
};
