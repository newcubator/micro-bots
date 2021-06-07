import { APIGatewayEvent } from 'aws-lambda';
import SES, { SendEmailRequest } from 'aws-sdk/clients/ses';
import { decode, ParsedUrlQuery } from 'querystring';

export interface EventApplication extends ParsedUrlQuery {
    event: string;
    firstname: string;
    email: string;
}

const SOURCE = 'events@newcubator.com';
const DESTINATIONS = ['events@newcubator.com'];

const ALLOWED_ORIGINS = [
    'https://newcubator.com',
    'http://localhost:8000',
    'http://localhost:6006',
];

export const handler = async (event: APIGatewayEvent) => {
    const command: EventApplication = decode(event.body) as EventApplication;
    console.log(`Event Application for ${command.event}: ${command.firstname} (${command.email})`);

    const requestOrigin = event.headers?.['Origin'];
    if (!requestOrigin || !ALLOWED_ORIGINS.includes(requestOrigin)) {
        return {
            statusCode: 405,
        };
    }

    const client = new SES({ region: 'eu-central-1' });
    const emailRequest: SendEmailRequest = {
        Message: {
            Subject: {
                Data: `Anmeldung für ${command.event}`,
                Charset: 'utf8',
            },
            Body: {
                Text: {
                    Data: `
Event: ${command.event}
Name: ${command.firstname}
Email: ${command.email}
                    `
                },
            }
        },
        Source: SOURCE,
        Destination: {
            ToAddresses: DESTINATIONS,
        },
    };
    await client.sendEmail(emailRequest).promise();

    console.log('Send event application mail');

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': requestOrigin,
        },
    };
};
