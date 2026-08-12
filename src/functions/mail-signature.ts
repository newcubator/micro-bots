import { decode } from "querystring";
import { HttpRequest, HttpResponse } from "../http/types";
import { findUserBySlackCommand, getUsers } from "../moco/users";
import { ActionType, MailSignatureFields, SlackCommandType } from "../slack/types/slack-types";

export enum SignatureType {
  NEWCUBATOR = "Newcubator",
  STADTQUEST = "StadtQUEST",
}

const signatureTypeOptions = [
  {
    value: SignatureType.NEWCUBATOR,
    text: {
      type: "plain_text" as const,
      text: SignatureType.NEWCUBATOR,
      emoji: true,
    },
  },
  {
    value: SignatureType.STADTQUEST,
    text: {
      type: "plain_text" as const,
      text: SignatureType.STADTQUEST,
      emoji: true,
    },
  },
];

const getJobTitle = (user: { custom_properties?: Record<string, unknown> }) => {
  const value = user.custom_properties?.["Job Bezeichnung"];
  return typeof value === "string" ? value.trim() : "";
};

export const handler = async (event: HttpRequest): Promise<HttpResponse> => {
  const command: SlackCommandType = decode(event.body ?? "") as SlackCommandType;
  const users = await getUsers().catch((error) => {
    console.error(
      JSON.stringify({
        service: "micro-bots",
        status: "mail_signature_user_load_failed",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return [];
  });
  const currentUser = findUserBySlackCommand(command)(users);
  const currentJobTitle = currentUser ? getJobTitle(currentUser) : "";

  const responseBody = {
    response_type: "ephemeral",
    text: "Mail-Signatur angefragt",
    blocks: [
      {
        type: "input",
        block_id: MailSignatureFields.MAIL_SIGNATURE_TYPE,
        label: {
          type: "plain_text",
          text: "Wähle den Signaturtyp aus:",
        },
        element: {
          type: "static_select",
          action_id: MailSignatureFields.MAIL_SIGNATURE_TYPE,
          initial_option: signatureTypeOptions[0],
          options: signatureTypeOptions,
        },
      },
      {
        type: "input",
        block_id: MailSignatureFields.MAIL_SIGNATURE_JOB_TITLE,
        label: {
          type: "plain_text",
          text: "Wähle deinen Jobtitel aus:",
        },
        element: {
          type: "plain_text_input",
          action_id: MailSignatureFields.MAIL_SIGNATURE_JOB_TITLE,
          ...(currentJobTitle ? { initial_value: currentJobTitle } : {}),
        },
      },
      {
        type: "actions",
        block_id: "confirmationButton",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Generieren",
            },
            value: "Confirmation",
            style: "primary",
            action_id: ActionType.MAIL_SIGNATURE,
          },
        ],
      },
    ],
  };

  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  };
};
