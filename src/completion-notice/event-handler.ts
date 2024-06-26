import { channelJoin } from "../slack/channel-join";
import { CompletionNoticeRequestedEvent } from "../slack/interaction-handler";
import { renderCompletionNoticePdf } from "./pdf";
import { EventBridgeEvent } from "aws-lambda";
import { getContactById } from "../moco/contacts";
import { getProject } from "../moco/projects";
import { slackClient } from "../clients/slack";
import dayjs from "dayjs";
import axios from "axios";

export const eventHandler = async (event: EventBridgeEvent<string, CompletionNoticeRequestedEvent>) => {
  console.log(`Handling event ${JSON.stringify(event.detail)}`);

  const project = await getProject(event.detail.projectId);
  const contact = await getContactById(project.contact.id);

  const pdf = renderCompletionNoticePdf({
    project: {
      name: project.name,
      orderNumber: project.custom_properties.Bestellnummer,
    },
    recipient: {
      salutation: contact.gender === "F" ? "geehrte Frau" : "geehrter Herr",
      firstname: contact.firstname,
      lastname: contact.lastname,
      address: project.billing_address,
    },
    date: dayjs(),
  });

  // Only user/bots that have joined a channel can post fiels
  await channelJoin(event.detail.channelId);

  const upload = await slackClient.files.upload({
    file: pdf,
    filename: `Fertigstellungsanzeige_${project.custom_properties.Bestellnummer}.pdf`,
    initial_comment: ``,
    channels: event.detail.channelId,
    thread_ts: event.detail.messageTs,
    broadcast: "true",
  });
  console.log(upload);
  if (!upload.ok) throw new Error(upload.error);

  console.log(
    await axios.post(event.detail.responseUrl, {
      replace_original: "true",
      text: `Die Fertigstellungsanzeige für '${project.name}' ist fertig! 🙌`,
    }),
  );
};
