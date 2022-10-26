import { slackChatPostMessage } from '../slack/slack';

const MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL = process.env.MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL;

export const handler = async () => {
    console.log("Bot works")
    try {
        const messageResponse = await slackChatPostMessage(
            `SlackMassage works`,
            MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL,
            "Twitter Bot",
            ":bird:"
        );
        console.log(`Wrote message ${JSON.stringify(messageResponse)}`);
    } catch (err) {
        console.error(err);
    }
}