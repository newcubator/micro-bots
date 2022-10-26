import axios from 'axios';
import { slackChatPostMessage } from '../slack/slack';

const qs = require('qs');

const MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL = process.env.MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL;

const TOKEN_ENDPOINT ='https://login.microsoftonline.com/1be0afda-f723-4ad4-bdc6-7603041ebe0e/oauth2/v2.0/token';
const postData = {
    client_id: '5b846559-5861-42d4-92b0-787bef833831',
    client_secret: 'JzB8Q~gcjTIBR8MR2lYDGfgd73slHsgidO6H.czI',
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
};


export const handler = async () => {
    console.log("Bot works")
    try {

        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

        const azureAccessToken = await axios
            .post(TOKEN_ENDPOINT, qs.stringify(postData))
            .then(response => {
                console.log(response.data);
                return response.data
            })
            .catch(error => {
                console.log(error);
            });

        console.log("Azure Access Token: ", azureAccessToken)

        const mailData = {
            '@odata.context': "https://graph.microsoft.com/v1.0/$metadata#users('c6b13425-2242-442b-8b50-c62af830ca68')/mailboxSettings",
            'automaticRepliesSetting': {
                "status": "scheduled",
                "externalAudience": "all",
                "internalReplyMessage": "<html><body><div style=\"font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt; color:rgb(0,0,0)\">Hier steht auch eine Testnachricht für die Kollegen drin!!</div></body></html>",
                "externalReplyMessage": "<html><body><div style=\"font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt; color:rgb(0,0,0)\">Hier Steht eine Testnachricht an Fremde Menschen drin!!</div></body></html>",
                "scheduledStartDateTime": {
                    "dateTime": "2022-12-20T06:00:00.0000000",
                    "timeZone": "UTC"
                },
                "scheduledEndDateTime": {
                    "dateTime": "2022-12-24T14:00:00.0000000",
                    "timeZone": "UTC"
                }
            }
        }

        const mailSignatureResponse = await axios
            .patch('https://graph.microsoft.com/v1.0/users/c6b13425-2242-442b-8b50-c62af830ca68/mailboxSettings', mailData, { headers: {"Authorization" : `Bearer ${azureAccessToken.access_token}`} })
            .then(response => {
                console.log(response.data);
                return response.data
            })
            .catch(error => {
                console.log(error);
            });

        console.log("Mail Signature Response: ", mailSignatureResponse)

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