import axios from "axios";
import dayjs from "dayjs";
import { removeUserPresences } from "../moco/presences";
import { createMultipleUserSchedules } from "../moco/schedules";
import { MocoUserType } from "../moco/types/moco-types";
import { findUserBySlackCommand, getUsers } from "../moco/users";
import { SickNoteRequestedEvent } from "../slack/interaction-handler";
import { slackChatPostMessage } from "../slack/slack";

export const eventHandler = async (event: SickNoteRequestedEvent) => {
  console.log(`Handling event ${JSON.stringify(event)}`);
  const user: MocoUserType | undefined = await getUsers().then(
    findUserBySlackCommand({
      user_id: event.userId,
      user_name: event.userName,
    }),
  );
  const generalChannel = process.env.GENERAL_CHANNEL;

  if (!user) {
    await axios.post(event.responseUrl, {
      replace_original: "true",
      text: `Wir konnten deinen aktuellen Benutzer nicht in Moco finden. Prüfe deinen Benutzernamen und setze im Zweifel manuell deine SlackID in Moco`,
    });
    return;
  }

  if (typeof generalChannel === "undefined") {
    throw new Error("No general Slack Channel given to post the message in!");
  }

  const isSingleDay = event.forSingleDay;
  const startDate = isSingleDay ? dayjs() : dayjs(event.startDay);
  const endDate = isSingleDay ? dayjs() : dayjs(event.endDay);

  const comment = isSingleDay ? "Krankheit ohne AU" : "Krankheit mit AU";
  const generalChannelMessage = isSingleDay
    ? `@${event.userName} muss sich heute leider krank melden. Gute Besserung!`
    : `@${event.userName} wurde vom ${startDate.format("DD.MM.YYYY")} bis zum ${endDate.format(
        "DD.MM.YYYY",
      )} krankgeschrieben. Gute Besserung!`;

  if (!isSingleDay && startDate.isAfter(endDate)) {
    console.log(
      await axios.post(event.responseUrl, {
        replace_original: "true",
        text: `Das Start-Datum darf nicht nach dem End-Datum liegen.`,
      }),
    );
    return;
  }
  try {
    await createMultipleUserSchedules(startDate, endDate, user.id, 3, true, true, comment, null, true);
    await removeUserPresences(user.id, startDate, endDate);
    await slackChatPostMessage(generalChannelMessage, generalChannel, "Krankschreibung", "😷");
  } catch (e) {
    console.error(e);
    await axios.post(event.responseUrl, {
      replace_original: "true",
      text: `Deine Krankmeldung konnte nicht eingereicht werden.`,
    });
    return;
  }

  await axios.post(event.responseUrl, {
    replace_original: "true",
    text: `Deine Krankmeldung wurde erfolgreich eingereicht! Gut Besserung!`,
  });
};
