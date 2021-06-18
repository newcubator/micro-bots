import { APIGatewayEvent } from 'aws-lambda';
import { jsPDF } from 'jspdf';
import { decode } from 'querystring';
import { createCompletionNoticePdf } from '../completion-notice/createCompletionNoticePdf';
import {
    completionNoticeErrorNoContactFound,
    completionNoticeErrorNoDealFound,
    completionNoticeErrorNoProjectFound
} from '../completion-notice/createSlackResponses';
import { getContactById } from '../moco/contacts';
import { getDealById } from '../moco/deals';
import { getProjects } from '../moco/projects';
import { slackUploadFileToChannel } from '../slack/slack';

export const handler = async (event: APIGatewayEvent) => {
    const { orderNumber }: { orderNumber: string } = decode(event.body) as { orderNumber: string };

    if (!orderNumber) {
        console.warn('Completion Notice PDF Creation lambda called without an order number');
        return;
    }

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
