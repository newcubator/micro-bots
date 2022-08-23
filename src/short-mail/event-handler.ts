import { EventBridgeEvent } from "aws-lambda";
import axios from "axios";
import dayjs from "dayjs";
import { slackClient } from "../clients/slack";
import { getCompanyById } from "../moco/companies";
import { getContactById } from "../moco/contacts";
import { channelJoin } from "../slack/channel-join";
import { ShortMailRequestedEvent } from "../slack/interaction-handler";
import { getRealSlackName } from "../slack/slack";
import { renderShortMailPdf } from "./pdf";

const dortmundAddressHeader = "newcubator GmbH | Westenhellweg 85-89 | 44137 Dortmund";
const dortmundAddressFooter = "\nWestenhellweg 85-89\n44137 Dortmund\n+49 (0) 231 58687380\n";
const hannoverAddressHeader = "newcubator GmbH | Bödekerstraße 22 | 30161 Hannover";
const hannoverAddressFooter = "\nBödekerstraße 22\n30161 Hannover\n+49 (0) 511-95731300\n";

export const eventHandler = async (event: EventBridgeEvent<string, ShortMailRequestedEvent>) => {
  console.log(`Handling event ${JSON.stringify(event.detail)}`);
  const recipient = await getContactById(event.detail.personId);
  console.log(recipient);
  let recipientCompanyAdress = "";
  if (recipient.company != null) {
    const recipientCompany = await getCompanyById(recipient.company.id);
    recipientCompanyAdress = recipientCompany.address;
  }
  let address = recipientCompanyAdress || recipient.work_address || recipient.home_address;
  if (address === "") {
    console.log(
      await axios.post(event.detail.responseUrl, {
        replace_original: "true",
        text: `Zu diesem Kontakt ist leider keine Adresse hinterlegt!`,
      })
    );
    return;
  }

  if (event.detail.message === null) {
    console.log(
      await axios.post(event.detail.responseUrl, {
        replace_original: "true",
        text: `Ohne Text kann ich leider keinen Brief schreiben!`,
      })
    );
    return;
  }

  const text = event.detail.message;

  const userProfile = await getRealSlackName(event.detail.sender);
  const userName = userProfile.profile.real_name;

  const pdf = renderShortMailPdf({
    sender: userName,
    senderAddressHeader: event.detail.location === "D" ? dortmundAddressHeader : hannoverAddressHeader,
    senderAddressFooter: event.detail.location === "D" ? dortmundAddressFooter : hannoverAddressFooter,
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
  await channelJoin(event.detail.channelId);

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
