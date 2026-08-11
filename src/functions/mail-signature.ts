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

const toPlainTextOption = (value: string) => ({
  value,
  text: {
    type: "plain_text" as const,
    text: value,
    emoji: true,
  },
});

export const handler = async (event: HttpRequest): Promise<HttpResponse> => {
  const command: SlackCommandType = decode(event.body ?? "") as SlackCommandType;
  const users = await getUsers();
  const currentUser = findUserBySlackCommand(command)(users);
  const currentJobTitle = currentUser ? getJobTitle(currentUser) : "";
  const jobTitles = [
    ...new Set([currentJobTitle, ...users.map(getJobTitle)].filter((jobTitle) => jobTitle.length > 0)),
  ].slice(0, 100);

  if (!jobTitles.length) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        response_type: "ephemeral",
        text: "Ich konnte keine MOCO-Jobtitel für die Mail-Signatur finden.",
      }),
    };
  }

  const jobTitleOptions = jobTitles.map(toPlainTextOption);

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
          type: "static_select",
          action_id: MailSignatureFields.MAIL_SIGNATURE_JOB_TITLE,
          initial_option: jobTitleOptions[0],
          options: jobTitleOptions,
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
