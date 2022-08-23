import { APIGatewayEvent } from "aws-lambda";
import { getContacts } from "../moco/contacts";
import { ActionType, ShortMailFields } from "../slack/types/slack-types";

export const commandHandler = async (event: APIGatewayEvent) => {
  // no need to parse the command input

  const contacts = await getContacts();
  console.log(contacts);
  const options = contacts
    .sort((a, b) => a.firstname.localeCompare(b.firstname))
    .filter((contact) => contact.company || contact.work_address || contact.home_address)
    .slice(0, 100) // slack allows 100 options max
    .map((contact) => {
      return {
        value: contact.id.toString(),
        text: {
          type: "plain_text",
          text: contact.firstname + " " + contact.lastname,
          emoji: true,
        },
      };
    });

  console.log(`Loaded ${options.length} contacts to select from MOCO`);

  if (!options.length) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        response_type: "in_channel",
        text: "Leider konnte ich keine Empfänger für deinen Brief finden.",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      response_type: "in_channel",
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
            type: "static_select",
            action_id: ShortMailFields.SHORT_MAIL_RECIPIENT,
            placeholder: {
              type: "plain_text",
              text: "Empfänger auswählen...",
              emoji: true,
            },
            options: options,
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
