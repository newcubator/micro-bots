import { APIGatewayEvent } from 'aws-lambda';
import { Lambda } from 'aws-sdk';
import { decode } from 'querystring';
import { completionNoticeErrorNoOrderNumber } from '../completion-notice/createSlackResponses';
import { SlackCommandType } from '../slack/types/slack-types';

export const handler = async (event: APIGatewayEvent) => {
    const command: SlackCommandType = decode(event.body) as SlackCommandType;
    const orderNumber = command.text?.trim();

    if (orderNumber === undefined) {
        return completionNoticeErrorNoOrderNumber();
    }

    const lambda = new Lambda();

    lambda.invoke({
        FunctionName: 'micro-bots-production-completionNoticePdfCreation',
        InvocationType: 'Event',
        LogType: 'Tail',
        Payload: JSON.stringify({ orderNumber }),
    });

    return {
        statusCode: 200,
        body: `Danke für deine Anfrage, ich werde nach einem Projekt mit der Bestellnummer: "${orderNumber}" suchen.`,
    };
};
