import { APIGatewayEvent } from "aws-lambda";
import { getContacts } from "../moco/contacts";
import { ActionType } from "../slack/types/slack-types";

export const commandHandler = async (event: APIGatewayEvent) => {
  // no need to parse the command input

  const contacts = await getContacts();
  console.log(contacts);
  const options = contacts
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
              label: {
                  type: "plain_text",
                  text: "Ich erstelle dir gerne einen Kurzbrief. Wähle dazu bitte den gewünschten Kontakt aus und gibt deine Nachricht ein.",
              },
              element: {
                  type: "static_select",
                  action_id: "selection",
                  placeholder: {
                      type: "plain_text",
                      text: "Kontakt auswählen...",
                      emoji: true,
                  },
                  options: options,
              }
          },
          {
            type: "input",
            element: {
              type: "plain_text_input",
              action_id: "plain_text_input-action",
                multiline: true,

          },
          label: {
              type: "plain_text",
              text: "Deine Nachricht:",
              emoji: true
          }
        },
          {
              type: "actions",
              elements: [
                  {
                      type: "button",
                      text: {
                          type: "plain_text",
                          text: "Click Me",
                          emoji: true
                      },
                      value: "click_me_123",
                      action_id: "actionId-0"
                  }
              ]
          }
      ],
    }),
  };
};
