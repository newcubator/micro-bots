import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { changeMailRespondForUser, getMailSettingsForUser } from "../_shared/microsoft/mail";
import { getUsers as microsoftGetUsers } from "../_shared/microsoft/users";
import { getUsersWithVacation } from "../moco/vacation";
import { slackChatPostMessage } from "../slack/slack";

const HOLIDAY_MAIL_REPLIES_CHANGE_SLACK_CHANNEL = process.env.HOLIDAY_MAIL_REPLIES_CHANGE_SLACK_CHANNEL;

if (typeof HOLIDAY_MAIL_REPLIES_CHANGE_SLACK_CHANNEL === "undefined") {
  throw new Error("Slack token missing");
}
dayjs.extend(utc);
export const handler = async () => {
  try {
    const usersWithVacation = await getUsersWithVacation();

    if (!usersWithVacation?.length) {
      return {
        statusCode: 200,
        body: "Aktuell hat niemand Urlaub",
      };
    }

    const microsoftUsers = await microsoftGetUsers();

    for (const userVacation of usersWithVacation) {
      const microsoftUser = microsoftUsers.value.find((user) => user.mail === userVacation.user.email);
      const mUserId = microsoftUser.id;
      const mUserDisplayName = microsoftUser.displayName;
      const startDate =
        userVacation.dates[userVacation.dates.findIndex((vacationDate) => dayjs(vacationDate) >= dayjs())];
      const endDate =
        userVacation.dates[userVacation.dates.findIndex((vacationDate) => dayjs(vacationDate) >= dayjs()) + 1];
      const standOrt = userVacation.user.custom_properties.Standort;

      const message = buildMessage(mUserDisplayName, standOrt, endDate);

      const mUserMailSettings = await getMailSettingsForUser(microsoftUser.id);
      const mUserMailScheduledStart = dayjs(mUserMailSettings.automaticRepliesSetting.scheduledStartDateTime.dateTime);

      if (dayjs(startDate).format("DD.MM.YYYY") != mUserMailScheduledStart.format("DD.MM.YYYY")) {
        await changeMailRespondForUser(mUserId, message, startDate, endDate);

        await slackChatPostMessage(
          `Die E-Mail Response für ${mUserDisplayName} wurde ab dem ${mUserMailScheduledStart.format(
            "DD.MM.YYYY"
          )} gesetzt. Hab einen schönen Urlaub!`,
          HOLIDAY_MAIL_REPLIES_CHANGE_SLACK_CHANNEL,
          "Mail Bot",
          ":e-mail:"
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
};

function buildMessage(displayName, standort, endDate) {
  const telDortmund = "0231-58687380";
  const telHannover = "0511-95731300";
  const dateForEmail = dayjs(endDate).add(1, "day");
  const telForMail = standort === "Dortmund" ? telDortmund : telHannover;

  return `<html><body><div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt; color:rgb(0,0,0)">
    Guten Tag,\n
    Vielen Dank für Ihre Nachricht. Ich befinde mich aktuell im Urlaub und habe währenddessen keinen Zugriff auf meine Mails. 
    Aus Vertraulichkeitsgründen wird Ihre E-Mail nicht automatisch weitergeleitet. Ich bin ab dem ${dateForEmail.format(
      "DD.MM.YYYY"
    )} wieder verfügbar. Bei dringenden Anliegen wenden Sie sich bitte an unser Büro unter 
    (<a href="mailto:info@newcubator.com">info@newcubator.com</a> / ${telForMail})\n
    Vielen Dank!\n
    Mit freundlichen Grüßen\n
    ${displayName}
    </div></body></html>`;
}
