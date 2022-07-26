import { EventBridgeEvent } from "aws-lambda";
import axios from "axios";
import dayjs from "dayjs";
import { slackClient } from "../clients/slack";
import { getCompanyById } from "../moco/companies";
import { getContactById } from "../moco/contacts";
import { channelLog } from "../slack/channel-log";
import { ShortMailRequestedEvent } from "../slack/interaction-handler";
import { renderShortMailPdf } from "./pdf";

export const eventHandler = async (event: EventBridgeEvent<string, ShortMailRequestedEvent>) => {
  console.log(`Handling event ${JSON.stringify(event.detail)}`);

  const recipient = await getContactById(event.detail.personId);
  console.log(recipient);

  const recipientCompany = await getCompanyById(recipient.company.id);
  let address = recipientCompany.address || recipient.work_address || recipient.home_address;
  console.log(address);

  if (address === "") {
    console.log(
      await axios.post(event.detail.responseUrl, {
        replace_original: "true",
        text: `Zu diesem Kontakt ist leider keine Adresse hinterlegt!`,
      })
    );
    return;
  }
  const text = event.detail.message;

  const formatSender = (s) => {
    let fullName = s.split(".");
    let firstName = fullName[0].charAt(0).toUpperCase() + fullName[0].substring(1);
    let lastName = fullName[1].charAt(0).toUpperCase() + fullName[1].substring(1);
    return firstName + " " + lastName;
  };

  const sender: string = formatSender(event.detail.sender);

  const pdf = renderShortMailPdf({
    sender: sender,
    recipient: {
      salutation: recipient.gender === "F" ? "geehrte Frau" : "H" ? "geehrter Herr" : "geehrte/r Frau/Herr",
      firstname: recipient.firstname,
      lastname: recipient.lastname,
      address: address,
    },
    date: dayjs(),
    text: text,
  });

  // Only user/bots that have joined a channel can post fiels
  await channelLog(event.detail.channelId);

  try {
    let upload = await slackClient.files.upload({
      file: pdf,
      filename: `Kurzbrief ${recipient.lastname}.pdf`,
      initial_comment: ``,
      channels: event.detail.channelId,
      thread_ts: event.detail.messageTs,
      broadcast: "true",
    });
    console.log(upload);
    if (upload.ok) {
      console.log(
        await axios.post(event.detail.responseUrl, {
          replace_original: "true",
          text: `Der Kurzbrief für '${recipient.firstname} ${recipient.lastname}' ist fertig! 🙌`,
        })
      );
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
