import axios from "axios";
import dayjs from "dayjs";
import { getAzureAccessToken } from "./token";

export async function getMessage(userPrincipalName: string, messageId: string): Promise<MicrosoftMessage> {
  const accessToken = await getAzureAccessToken();

  return axios
    .get(`https://graph.microsoft.com/v1.0/users/${userPrincipalName}/messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'IdType="ImmutableId",outlook.body-content-type="text"',
      },
    })
    .then((response) => {
      console.debug(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error while calling microsoft graph api to get message!");
      throw error;
    });
}

export async function getMessageAttachments(
  userPrincipalName: string,
  messageId: string
): Promise<MicrosoftAttachment[]> {
  const accessToken = await getAzureAccessToken();

  return axios
    .get(`https://graph.microsoft.com/v1.0/users/${userPrincipalName}/messages/${messageId}/attachments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      console.debug(response.data.value);
      return response.data.value;
    })
    .catch((error) => {
      console.error("Error while calling microsoft graph api to get message attachments!");
      throw error;
    });
}

export async function markMessageAsRead(userPrincipalName: string, messageId: string) {
  const accessToken = await getAzureAccessToken();

  return axios
    .patch(
      `https://graph.microsoft.com/v1.0/users/${userPrincipalName}/messages/${messageId}`,
      {
        isRead: true,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((response) => {
      console.debug(response.data);
      return;
    })
    .catch((error) => {
      console.error("Error while calling microsoft graph api to mark message as read!");
      throw error;
    });
}

export async function moveMessage(userPrincipalName: string, messageId: string, destinationId: string) {
  const accessToken = await getAzureAccessToken();

  return axios
    .post(
      `https://graph.microsoft.com/v1.0/users/${userPrincipalName}/messages/${messageId}/move`,
      {
        destinationId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((response) => {
      console.debug(response.data);
      return;
    })
    .catch((error) => {
      console.error("Error while calling microsoft graph api to move message!");
      throw error;
    });
}

export async function changeMailRespondForUser(microsoftUserId, message, startDate, endDate) {
  const accessToken = await getAzureAccessToken();

  const mailData = {
    "@odata.context": `https://graph.microsoft.com/v1.0/$metadata#users('${microsoftUserId}')/mailboxSettings`,
    automaticRepliesSetting: {
      status: "scheduled",
      externalAudience: "all",
      internalReplyMessage: message,
      scheduledStartDateTime: {
        dateTime: dayjs(startDate).utc().format(),
        timeZone: "UTC",
      },
      scheduledEndDateTime: {
        dateTime: dayjs(endDate).add(1, "day").utc().format(),
        timeZone: "UTC",
      },
    },
  };

  return axios
    .patch(`https://graph.microsoft.com/v1.0/users/${microsoftUserId}/mailboxSettings`, mailData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function getMailSettingsForUser(microsoftUserId) {
  const accessToken = await getAzureAccessToken();

  return axios
    .get(`https://graph.microsoft.com/v1.0/users/${microsoftUserId}/mailboxSettings`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

/**
 * Message Resource
 *
 * Only used properties are mapped!
 * @See https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0#properties
 */
export interface MicrosoftMessage {
  id: string;
  from: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
  subject: string;
  body: {
    content: string;
  };
  hasAttachments: boolean;
  webLink: string;
}

/**
 * Mail Attachment Resource
 *
 * Only used properties are mapped!
 * @See https://learn.microsoft.com/en-us/graph/api/resources/fileattachment?view=graph-rest-1.0#properties
 */
export interface MicrosoftAttachment {
  contentId: string;
  contentBytes: string;
  contentType: string;
  name: string;
  isInline: boolean;
}
