import axios from "axios";
import { slackChatPostMessage } from "../slack/slack";

const qs = require("qs");

const MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL = process.env.MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL;
const MICROSOFT_TOKEN = process.env.MICROSOFT_TOKEN;
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;

const TOKEN_ENDPOINT = `https://login.microsoftonline.com/${MICROSOFT_TOKEN}/oauth2/v2.0/token`;
const postData = {
  client_id: MICROSOFT_CLIENT_ID,
  client_secret: MICROSOFT_CLIENT_SECRET,
  scope: "https://graph.microsoft.com/.default",
  grant_type: "client_credentials",
};

export const handler = async () => {
  console.log("Bot works");
  try {
    const azureAccessToken = await axios
      .post(TOKEN_ENDPOINT, qs.stringify(postData), {
        headers: { "Content-Type": `application/x-www-form-urlencoded` },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });

    console.log("Azure Access Token: ", azureAccessToken);

    const userId = "c6b13425-2242-442b-8b50-c62af830ca68";

    const mailData = {
      "@odata.context": `https://graph.microsoft.com/v1.0/$metadata#users('${userId}')/mailboxSettings`,
      automaticRepliesSetting: {
        status: "scheduled",
        externalAudience: "all",
        internalReplyMessage:
          '<html><body><div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt; color:rgb(0,0,0)">Hier steht auch eine Testnachricht für die Kollegen drin!!</div></body></html>',
        externalReplyMessage:
          '<html><body><div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt; color:rgb(0,0,0)">Hier Steht eine Testnachricht an Fremde Menschen drin!!</div></body></html>',
        scheduledStartDateTime: {
          dateTime: "2022-12-20T06:00:00.0000000",
          timeZone: "UTC",
        },
        scheduledEndDateTime: {
          dateTime: "2022-12-24T14:00:00.0000000",
          timeZone: "UTC",
        },
      },
    };

    const mailSignatureResponse = await axios
      .patch(`https://graph.microsoft.com/v1.0/users/${userId}/mailboxSettings`, mailData, {
        headers: { Authorization: `Bearer ${azureAccessToken.access_token}` },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });

    console.log("Mail Signature Response: ", mailSignatureResponse);

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
};
