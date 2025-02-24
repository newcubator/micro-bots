import { APIGatewayEvent } from "aws-lambda";
import { ActionType, ShortMailFields } from "../slack/types/slack-types";
import { decode } from "querystring";

export const commandHandler = async (event: APIGatewayEvent) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      text: "Kurzbrief angefragt",
      blocks: [
        {
          type: "input",
          block_id: ShortMailFields.SHORT_MAIL_RECIPIENT,
          label: {
            type: "plain_text",
            text: "Ich erstelle dir gerne einen Kurzbrief. Wähle dazu den Empfänger und deinen Standort aus und gibt deine Nachricht ein.",
          },
          element: {
            type: "external_select",
            action_id: ShortMailFields.SHORT_MAIL_RECIPIENT,
            placeholder: {
              type: "plain_text",
              text: "Empfänger auswählen...",
              emoji: true,
            },
          },
        },
        {
          type: "input",
          block_id: ShortMailFields.SHORT_MAIL_TEXT,
          element: {
            type: "plain_text_input",
            action_id: ShortMailFields.SHORT_MAIL_TEXT,
            multiline: true,
            max_length: 2500,
          },
          label: {
            type: "plain_text",
            text: "Deine Nachricht:",
            emoji: true,
          },
        },
        {
          type: "input",
          block_id: ShortMailFields.SHORT_MAIL_LOCATION,
          label: {
            type: "plain_text",
            text: "Wähle deinen Standort aus:",
          },
          element: {
            type: "static_select",
            action_id: ShortMailFields.SHORT_MAIL_LOCATION,
            placeholder: {
              type: "plain_text",
              text: "Standort auswählen...",
              emoji: true,
            },
            options: [
              {
                text: {
                  type: "plain_text",
                  text: "Dortmund",
                  emoji: true,
                },
                value: "D",
              },
              {
                text: {
                  type: "plain_text",
                  text: "Hannover",
                  emoji: true,
                },
                value: "H",
              },
            ],
          },
        },
        {
          type: "input",
          block_id: ShortMailFields.SHORT_MAIL_SENDER,
          label: {
            type: "plain_text",
            text: "Wähle den Absender aus:",
          },
          element: {
            type: "users_select",
            action_id: ShortMailFields.SHORT_MAIL_SENDER,
            initial_user: decode(event.body)["user_id"],
            placeholder: {
              type: "plain_text",
              text: "Absender wählen...",
            },
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
              action_id: ActionType.SHORT_MAIL,
            },
          ],
        },
      ],
    }),
  };
};
