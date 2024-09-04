import { ActionType, PrivateChannelFields } from "../slack/types/slack-types";

export const commandHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      text: "Private channel angefragt",
      blocks: [
        {
          type: "section",
          block_id: PrivateChannelFields.PRIVATE_CHANNEL_USERS,
          text: {
            type: "mrkdwn",
            text: "Ich erstelle dir gerne einen privaten Channel. Gib hierfür nur an, wen du nicht in dem Channel haben möchtest:",
          },
          accessory: {
            type: "multi_users_select",
            action_id: PrivateChannelFields.PRIVATE_CHANNEL_USERS,
            placeholder: {
              type: "plain_text",
              text: "Nutzer auswählen...",
            },
          },
        },
        {
          type: "input",
          block_id: PrivateChannelFields.PRIVATE_CHANNEL_NAME,
          element: {
            type: "plain_text_input",
            action_id: PrivateChannelFields.PRIVATE_CHANNEL_NAME,
            multiline: false,
            max_length: 200,
          },
          label: {
            type: "plain_text",
            text: "Channel Name (keine Leerzeichen und nur Kleinbuchstaben):",
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
                text: "Erstellen",
              },
              value: "Confirmation",
              style: "primary",
              action_id: ActionType.PRIVATE_CHANNEL,
            },
          ],
        },
      ],
    }),
  };
};
