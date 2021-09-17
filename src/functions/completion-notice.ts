import { APIGatewayEvent } from "aws-lambda";
import { jsPDF } from "jspdf";
import { decode } from "querystring";
import { createCompletionNoticePdf } from "../completion-notice/createCompletionNoticePdf";
import {
  completionNoticeErrorNoContactFound,
  completionNoticeErrorNoDealFound,
  completionNoticeErrorNoOrderNumber,
  completionNoticeErrorNoProjectFound,
  completionNoticeSuccess,
} from "../completion-notice/createSlackResponses";
import { sendEphemeralResponse } from "../completion-notice/sendEphemeralResponse";
import { getContactById } from "../moco/contacts";
import { getDealById } from "../moco/deals";
import { getProjects } from "../moco/projects";
import { slackUploadFileToChannel } from "../slack/slack";
import { SlackCommandType } from "../slack/types/slack-types";

export const handler = async (event: APIGatewayEvent) => {
  console.time("Completion Notice");
  const command: SlackCommandType = decode(event.body) as SlackCommandType;
  const orderNumber = command.text?.trim();

  if (orderNumber === undefined) {
    return completionNoticeErrorNoOrderNumber();
  }
  sendEphemeralResponse(command.response_url, completionNoticeSuccess(orderNumber));

  console.time("Fetching Projects");
  const project = (await getProjects()).find((project) => project.custom_properties.Bestellnummer === orderNumber);
  console.timeEnd("Fetching Projects");
  console.log(`project: ${JSON.stringify(project, null, 2)}`);
  if (project === undefined) {
    return completionNoticeErrorNoProjectFound();
  }

  console.time("Fetching Deal");
  const deal = await getDealById(project.deal.id);
  console.timeEnd("Fetching Deal");
  console.log(`deal: ${JSON.stringify(deal, null, 2)}`);

  if (deal === undefined) {
    return completionNoticeErrorNoDealFound();
  }

  console.time("Fetching Contact");
  const contact = await getContactById(deal.person.id);
  console.timeEnd("Fetching Contact");

  if (contact === undefined) {
    return completionNoticeErrorNoContactFound();
  }

  console.time("Creating PDF");
  const pdf: jsPDF = createCompletionNoticePdf(project, contact);
  console.timeEnd("Creating PDF");

  console.time("Slack Upload");
  await slackUploadFileToChannel(
    process.env.COMPLETION_NOTICE_CHANNEL,
    Buffer.from(pdf.output("arraybuffer")),
    `${orderNumber}.pdf`,
    `Hier ist die Fertigstellungsanzeige für das Projekt: ${project.name}, Bestellnummer: ${orderNumber}`
  );
  console.timeEnd("Slack Upload");
  console.timeEnd("Completion Notice");
};
