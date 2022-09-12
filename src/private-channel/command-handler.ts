import { getProjects } from '../moco/projects';
import { getUsers } from '../moco/users';
import { slackUsersList } from '../slack/slack';
import { ActionType, PrivateChannelFields, ShortMailFields } from '../slack/types/slack-types';

export const commandHandler = async () => {

    const projects = await slackUsersList();
    const options = projects.members
        .slice(0, 100) // slack allows 100 options max
        .map((user) => {
            return {
                value: user.id.toString(),
                text: {
                    type: "plain_text",
                    text: user.real_name,
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
                text: "Konnte keine Projekte finden.",
            }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            response_type: "in_channel",
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
                        text: "Channel Name:",
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
