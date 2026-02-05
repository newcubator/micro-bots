import { EventBridgeEvent } from "aws-lambda";
import axios from "axios";
import dayjs from "dayjs";
import { removeUserPresences } from "../moco/presences";
import { createMultipleUserSchedules } from "../moco/schedules";
import { MocoUserType } from "../moco/types/moco-types";
import { findUserBySlackCommand, getUsers } from "../moco/users";
import { SickNoteRequestedEvent } from "../slack/interaction-handler";
import { slackChatPostMessage } from "../slack/slack";

export const eventHandler = async (event: EventBridgeEvent<string, SickNoteRequestedEvent>) => {
  console.log(`Handling event ${JSON.stringify(event.detail)}`);
  const user: MocoUserType = await getUsers().then(
    findUserBySlackCommand({
      user_id: event.detail.userId,
      user_name: event.detail.userName,
    }),
  );

  const isSingleDay = event.detail.forSingleDay;
  const startDate = isSingleDay ? dayjs() : dayjs(event.detail.startDay);
  const endDate = isSingleDay ? dayjs() : dayjs(event.detail.endDay);

  const comment = isSingleDay ? "Krankheit ohne AU" : "Krankheit mit AU";
  const generalChannelMessage = isSingleDay
    ? `@${event.detail.userName} muss sich heute leider krank melden. Gute Besserung!`
    : `@${event.detail.userName} wurde vom ${startDate.format("DD.MM.YYYY")} bis zum ${endDate.format(
        "DD.MM.YYYY",
      )} krankgeschrieben. Gute Besserung!`;

  if (!isSingleDay && startDate.isAfter(endDate)) {
    console.log(
      await axios.post(event.detail.responseUrl, {
        replace_original: "true",
        text: `Das Start-Datum darf nicht nach dem End-Datum liegen.`,
      }),
    );
    return;
  }
  try {
    await createMultipleUserSchedules(startDate, endDate, user.id, 3, true, true, comment, null, true);
    await removeUserPresences(user.id, startDate, endDate);
    await slackChatPostMessage(generalChannelMessage, process.env.GENERAL_CHANNEL, "Krankschreibung", "😷");
  } catch (e) {
    console.error(e);
    await axios.post(event.detail.responseUrl, {
      replace_original: "true",
      text: `Deine Krankmeldung konnte nicht eingereicht werden.`,
    });
    return;
  }

  await axios.post(event.detail.responseUrl, {
    replace_original: "true",
    text: `Deine Krankmeldung wurde erfolgreich eingereicht! Gut Besserung!`,
  });
};
