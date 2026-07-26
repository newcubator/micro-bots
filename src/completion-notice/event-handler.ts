import { channelJoin } from "../slack/channel-join";
import { CompletionNoticeRequestedEvent } from "../slack/interaction-handler";
import { renderCompletionNoticePdf } from "./pdf";
import { getContactById } from "../moco/contacts";
import { getProject } from "../moco/projects";
import dayjs from "dayjs";
import axios from "axios";
import { uploadFileToSlackChannel } from "../slack/upload-file-to-slack-channel";

export const eventHandler = async (event: CompletionNoticeRequestedEvent) => {
  console.log(`Handling event ${JSON.stringify(event)}`);

  const project = await getProject(event.projectId);
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

  // Only user/bots that have joined a channel can post files
  await channelJoin(event.channelId);

  const upload = await uploadFileToSlackChannel({
    file: pdf,
    filename: `Fertigstellungsanzeige_${project.custom_properties.Bestellnummer}.pdf`,
    initial_comment: ``,
    channels: event.channelId,
    thread_ts: event.messageTs,
  });
  console.log(upload);
  if (!upload.ok) throw new Error(upload.error);

  console.log(
    await axios.post(event.responseUrl, {
      replace_original: "true",
      text: `Die Fertigstellungsanzeige für '${project.name}' ist fertig! 🙌`,
    }),
  );
};
