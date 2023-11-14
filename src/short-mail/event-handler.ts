import { EventBridgeEvent } from "aws-lambda";
import axios from "axios";
import dayjs from "dayjs";
import { slackClient } from "../clients/slack";
import { getCompanyById } from "../moco/companies";
import { getContactById } from "../moco/contacts";
import { getUserById } from "../moco/users";
import { channelJoin } from "../slack/channel-join";
import { ShortMailRequestedEvent } from "../slack/interaction-handler";
import { getSlackUserProfile, slackChatPostEphemeral } from "../slack/slack";
import { ActionType } from "../slack/types/slack-types";
import { renderShortMailPdf } from "./pdf";

export const eventHandler = async (event: EventBridgeEvent<string, ShortMailRequestedEvent>) => {
  console.log(`Handling event ${JSON.stringify(event.detail)}`);
  let recipient;
  let address;
  let salutation;

  if (event.detail.personId.length <= 6) {
    //the ID of contacts in moco has a maximum of 6 digits, while the employee IDs always have more digits
    recipient = await getContactById(event.detail.personId);
    let recipientCompanyAddress = "";
    if (recipient.company != null) {
      const recipientCompany = await getCompanyById(recipient.company.id);
      recipientCompanyAddress = recipientCompany.address;
    }
    salutation =
      recipient.gender === "F"
        ? `Sehr geehrte Frau ${recipient.lastname}`
        : recipient.gender === "H"
          ? `Sehr geehrter Herr ${recipient.lastname}`
          : `Sehr geehrte/r Frau/Herr ${recipient.lastname}`;
    address = recipientCompanyAddress || recipient.work_address || recipient.home_address;
  } else {
    recipient = await getUserById(event.detail.personId);
    address = recipient.home_address;
    salutation = `Hallo ${recipient.firstname}`;
  }

  if (!address) {
    console.log(
      await axios.post(event.detail.responseUrl, {
        replace_original: "true",
        text: `Zu diesem Kontakt ist leider keine Adresse hinterlegt!`,
      }),
    );
    return;
  }

  if (!event.detail.message) {
    console.log(
      await axios.post(event.detail.responseUrl, {
        replace_original: "true",
        text: `Ohne Text kann ich leider keinen Brief schreiben!`,
      }),
    );
    return;
  }

  const text = event.detail.message;

  const userProfile = await getSlackUserProfile(event.detail.sender);
  const userName = userProfile.profile.real_name;

  const pdf = await renderShortMailPdf({
    sender: userName,
    location: event.detail.location,

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
  await channelJoin(event.detail.channelId);

  try {
    const upload = await slackClient.files.upload({
      file: pdf,
      filename: `Kurzbrief ${recipient.lastname}.pdf`,
      initial_comment: ``,
      channels: event.detail.channelId,
      thread_ts: event.detail.messageTs,
      broadcast: "true",
    });
    if (upload.ok) {
      await axios.post(event.detail.responseUrl, {
        replace_original: "true",
        text: `Der Kurzbrief für '${recipient.firstname} ${recipient.lastname}' ist fertig! 🙌`,
      });
      await slackChatPostEphemeral(
        event.detail.channelId,
        "Möchtest du den Brief direkt verschicken?",
        event.detail.sender,
        [
          {
            text: {
              type: "mrkdwn",
              text: `Möchtest du den Brief direkt per LetterXpress verschicken?`,
            },
            type: "section",
          },
          {
            type: "actions",
            block_id: "uploadButton",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Verschicken",
                },
                value: upload.file?.url_private,
                style: "primary",
                action_id: ActionType.UPLOAD_LETTERXPRESS,
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Abbrechen",
                },
                style: "danger",
                action_id: ActionType.CANCEL,
              },
            ],
          },
        ],
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
