import { slackChatPostMessage } from '../slack/slack';

const MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL = process.env.MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL;
const MICROSOFT_TOKEN = process.env.MICROSOFT_TOKEN;
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;

const TOKEN_ENDPOINT = `https://login.microsoftonline.com/${MICROSOFT_TOKEN}/oauth2/v2.0/token`;

const postDataForToken = {
  client_id: MICROSOFT_CLIENT_ID,
  client_secret: MICROSOFT_CLIENT_SECRET,
  scope: "https://graph.microsoft.com/.default",
  grant_type: "client_credentials",
};

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