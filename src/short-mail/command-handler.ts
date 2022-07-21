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
  console.log(`Loaded ${options.length} projects to select from`);

  if (!options.length) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        response_type: "in_channel",
        text: "Konnte keine Kontakte finden.",
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
          block_id: ShortMailFields.SHORT_MAIL_SELECTION,
          label: {
            type: "plain_text",
            text: "Ich erstelle dir gerne einen Kurzbrief. Gibt dazu bitte deine Nachricht ein und wähle anschließend den gewünschten Kontakt aus.",
          },
          element: {
            type: "static_select",
            action_id: ShortMailFields.SHORT_MAIL_SELECTION,
            placeholder: {
              type: "plain_text",
              text: "Kontakt auswählen...",
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
          },
          label: {
            type: "plain_text",
            text: "Deine Nachricht:",
            emoji: true,
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
