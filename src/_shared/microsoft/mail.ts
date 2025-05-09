import axios from "axios";
import dayjs from "dayjs";
import { getAzureAccessToken } from "./token";

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
