import { decode } from "querystring";
import { HttpRequest, HttpResponse } from "../http/types";
import { SlackCommandType } from "../slack/types/slack-types";

export const handler = async (event: HttpRequest): Promise<HttpResponse> => {
  const command: SlackCommandType = decode(event.body ?? "") as SlackCommandType;

  const responseBody = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Du kannst deine Mail Signatur unter https://microbots.hubertus.newcubator.com/mailSignatureGenerator?user_id=${command.user_id}&user_name=${command.user_name} abrufen.`,
        },
      },
    ],
  };

  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  };
};
