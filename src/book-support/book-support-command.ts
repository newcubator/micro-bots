import { APIGatewayEvent } from "aws-lambda";
import {ActionType} from "../slack/types/slack-types";

export const commandHandler = async (event: APIGatewayEvent) => {
    // const command: SlackCommandType = decode(event.body) as SlackCommandType;
    return {
        statusCode: 200,
        body: JSON.stringify({
            blocks: [
                {
                    dispatch_action: true,
                    type: "input",
                    block_id: "BOOK_SUPPORT_TEXT",
                    element: {
                        type: "plain_text_input",
                        action_id: ActionType.BOOK_SUPPORT
                    },
                    label: {
                        type: "plain_text",
                        text: "Ich beantworte dir gerne Fragen zum Book! Was möchtest du wissen?",
                        emoji: true
                    }
                }
            ]
        }),
    };
};
