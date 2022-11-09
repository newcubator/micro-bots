import axios from "axios";
import dayjs from "dayjs";
import { getAzureAccessToken } from "./token";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function changeMailRespondForUser(microsoftUserId, startDate, endDate) {
  const azureAccessToken = await getAzureAccessToken();

  startDate = dayjs(startDate).utc().format();
  endDate = dayjs(endDate).utc().format();

  const mailData = {
    "@odata.context": `https://graph.microsoft.com/v1.0/$metadata#users('${microsoftUserId}')/mailboxSettings`,
    automaticRepliesSetting: {
      status: "scheduled",
      externalAudience: "all",
      internalReplyMessage:
        '<html><body><div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt; color:rgb(0,0,0)">Hier steht auch eine Testnachricht für die Kollegen drin!!</div></body></html>',
      externalReplyMessage:
        '<html><body><div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt; color:rgb(0,0,0)">Hier Steht eine Testnachricht an Fremde Menschen drin!!</div></body></html>',
      scheduledStartDateTime: {
        dateTime: startDate,
        timeZone: "UTC",
      },
      scheduledEndDateTime: {
        dateTime: endDate,
        timeZone: "UTC",
      },
    },
  };

  return axios
    .patch(`https://graph.microsoft.com/v1.0/users/${microsoftUserId}/mailboxSettings`, mailData, {
      headers: { Authorization: `Bearer ${azureAccessToken.access_token}` },
    })
    .then((response) => {
      console.log("ResponseData", response.data);
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}
