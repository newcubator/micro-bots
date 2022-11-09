import dayjs from "dayjs";
import { changeMailRespondForUser } from "../microsoft/mail";
import { getUsersWithVacation } from "../moco/vacation";
import { slackChatPostMessage } from "../slack/slack";
import { getUsers as microsoftGetUsers } from "../microsoft/users";

const MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL = process.env.MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL;

export const handler = async () => {
  console.log("Bot works");
  try {
    const usersWithVacation = await getUsersWithVacation();
    console.log("usersWithVacation", usersWithVacation);

    if (!usersWithVacation.length) {
      console.log("Niemand hat urlaub");
      return;
    }

    const microsoftUsers = await microsoftGetUsers();

    for (const userVacation of usersWithVacation) {
      const microsoftUser = microsoftUsers.value.find((user) => user.mail === userVacation.user.email);
      const startDate =
        userVacation.dates[userVacation.dates.findIndex((vacationDate) => dayjs(vacationDate) >= dayjs())];
      const endDate =
        userVacation.dates[userVacation.dates.findIndex((vacationDate) => dayjs(vacationDate) >= dayjs()) + 1];

      const mailSignatureResponse = await changeMailRespondForUser(microsoftUser.id, startDate, endDate);
      console.log("mailSignatureResponse", mailSignatureResponse);
    }

    // const messageResponse = await slackChatPostMessage(
    //   `SlackMassage works!`,
    //   MAIL_SIGNATUR_CHANGE_SLACK_CHANNEL,
    //   "Mail Bot",
    //   ":e-mail:"
    // );
    // console.log(`Wrote message ${JSON.stringify(messageResponse)}`);
  } catch (err) {
    console.error(err);
  }
};
