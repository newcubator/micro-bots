import { APIGatewayEvent } from 'aws-lambda';
import { jsPDF } from 'jspdf';
import { decode } from 'querystring';
import { createCompletionNoticePdf } from '../completion-notice/createCompletionNoticePdf';
import {
    completionNoticeErrorNoContactFound,
    completionNoticeErrorNoDealFound,
    completionNoticeErrorNoOrderNumber,
    completionNoticeErrorNoProjectFound,
    completionNoticeSuccess
} from '../completion-notice/createSlackResponses';
import { sendEphemeralResponse } from '../completion-notice/sendEphemeralResponse';
import { getContactById } from '../moco/contacts';
import { getDealById } from '../moco/deals';
import { getProjects } from '../moco/projects';
import { slackUploadFileToChannel } from '../slack/slack';
import { SlackCommandType } from '../slack/types/slack-types';

export const handler = async (event: APIGatewayEvent) => {
    const command: SlackCommandType = decode(event.body) as SlackCommandType;
    const orderNumber = command.text?.trim();

    if (orderNumber === undefined) {
        return completionNoticeErrorNoOrderNumber();
    }
    sendEphemeralResponse(command.response_url, completionNoticeSuccess(orderNumber));

    const project = (await getProjects()).find(project => project.custom_properties.Bestellnummer === orderNumber);
    console.log(`project: ${project}`);
    if (project === undefined) {
        return completionNoticeErrorNoProjectFound();
    }

    const deal = (await getDealById(project.deal.id));
    console.log(`deal: ${deal}`);

    if (deal === undefined) {
        return completionNoticeErrorNoDealFound();
    }

    const contact = (await getContactById(deal.person.id));

    if (contact === undefined) {
        return completionNoticeErrorNoContactFound();
    }

    const pdf: jsPDF = createCompletionNoticePdf(project, contact);

    await slackUploadFileToChannel(process.env.COMPLETION_NOTICE_CHANNEL,
        Buffer.from(pdf.output('arraybuffer')),
        `${orderNumber}.pdf`,
        `Hier ist die Fertigstellungsanzeige für das Projekt: ${project.name}, Bestellnummer: ${orderNumber}`
    );
};
