import axios from "axios";
import dayjs from "dayjs";
import { getCompanyById } from "../moco/companies";
import { getContactById } from "../moco/contacts";
import { getUserById } from "../moco/users";
import { channelJoin } from "../slack/channel-join";
import { ShortMailRequestedEvent } from "../slack/interaction-handler";
import { getSlackUserProfile } from "../slack/slack";
import { renderShortMailPdf } from "./pdf";
import { uploadFileToSlackChannel } from "../slack/upload-file-to-slack-channel";

export const eventHandler = async (event: ShortMailRequestedEvent) => {
  console.log(`Handling event ${JSON.stringify(event)}`);
  let recipient;
  let address;
  let salutation;

  if (event.personId.length <= 7) {
    //the ID of contacts in moco has a maximum of 7 digits, while the employee IDs always have more digits
    //TODO: this is a hack, we should find a better way to distinguish between contacts and employees

    recipient = await getContactById(event.personId);
    let recipientCompanyAddress = "";
    if (recipient.company != null) {
      const recipientCompany = await getCompanyById(recipient.company.id);
      recipientCompanyAddress = recipientCompany.address;
    }
    salutation =
      recipient.gender === "F"
        ? `Sehr geehrte Frau ${recipient.lastname}`
        : recipient.gender === "M"
          ? `Sehr geehrter Herr ${recipient.lastname}`
          : `Sehr geehrte/r Frau/Herr ${recipient.lastname}`;
    address = recipientCompanyAddress || recipient.work_address || recipient.home_address;
  } else {
    recipient = await getUserById(event.personId);
    address = recipient.home_address;
    salutation = `Hallo ${recipient.firstname}`;
  }

  if (!address) {
    console.log(
      await axios.post(event.responseUrl, {
        replace_original: "true",
        text: `Zu diesem Kontakt ist leider keine Adresse hinterlegt!`,
      }),
    );
    return;
  }

  if (!event.message) {
    console.log(
      await axios.post(event.responseUrl, {
        replace_original: "true",
        text: `Ohne Text kann ich leider keinen Brief schreiben!`,
      }),
    );
    return;
  }

  const text = event.message;

  const userProfile = await getSlackUserProfile(event.sender);
  const userName = userProfile.profile?.real_name ?? event.sender;

  const pdf = await renderShortMailPdf({
    sender: userName,
    location: event.location,

    recipient: {
      salutation,
      firstname: recipient.firstname,
      lastname: recipient.lastname,
      address,
    },
    date: dayjs(),
    text,
  });

  // Only user/bots that have joined a channel can post files
  await channelJoin(event.channelId);

  try {
    const upload = await uploadFileToSlackChannel({
      file: pdf,
      filename: `Kurzbrief ${recipient.lastname}.pdf`,
      initial_comment: ``,
      channels: event.channelId,
      thread_ts: event.messageTs,
    });
    if (upload.ok) {
      await axios.post(event.responseUrl, {
        replace_original: "true",
        text: `Der Kurzbrief für '${recipient.firstname} ${recipient.lastname}' ist fertig! 🙌`,
      });
    }
  } catch (error) {
    await axios.post(event.responseUrl, {
      replace_original: "true",
      text: `Es ist ein Fehler beim Erstellen des Kurzbriefs für '${recipient.firstname} ${recipient.lastname}' aufgetreten! 😔`,
    });
    console.error(error);
    throw new Error("Failed to create short mail", { cause: error });
  }
};
