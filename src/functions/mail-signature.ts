import { APIGatewayEvent } from 'aws-lambda';
import { decode } from 'querystring';
import { MocoUserType } from '../moco/types/moco-types';
import { findUserBySlackCommand, getUsers } from '../moco/users';
import { SlackCommandType } from '../slack/types/slack-types';

export const handler = async (event: APIGatewayEvent) => {
    const command: SlackCommandType = decode(event.body) as SlackCommandType;
    const user: MocoUserType = await getUsers()
        .then(findUserBySlackCommand(command));

    if (!user) {
        return {
            statusCode: 200,
            body: 'Ich konnte dich leider keinem Moco User zuordnen.'
        };
    }

    console.log('Creating mail signature for', user.firstname, user.lastname);

    const responseBody = {
        'blocks': [{
            'type': 'section',
            'text': {
                'type': 'mrkdwn',
                'text': createMailSignature(user),
            },
        }],
    };

    return {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };
};

function createMailSignature(user: MocoUserType): string {
    const addressHannover = `
Bödekerstraße 22
D-30161 Hannover
    `;
    const addressDortmund = `
Freie-Vogel-Straße 369
D-44269 Dortmund
    `;

    return `
<pre style="font-variant-ligatures: normal; orphans: 2; widows: 2;"><code style="padding: 3px 0px;"><font color="#000000">
${user.firstname} ${user.lastname}

---------------------------------------------------------
newcubator GmbH
${user.custom_properties.Standort === 'Dortmund' ? addressDortmund : addressHannover}

${user.work_phone ? `Telefon: ${user.work_phone}` : ''}
${user.mobile_phone ? `Mobil: ${user.mobile_phone}` : ''}
${user.email ? `Email: ${user.email}` : ''}

Geschäftsführer: Jörg Herbst
Sitz der Gesellschaft: Hannover, Amtsgericht Hannover HRB 221930
</font></code></pre>
    `;
}
