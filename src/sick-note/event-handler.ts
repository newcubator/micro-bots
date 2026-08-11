import axios from "axios";
import dayjs from "dayjs";
import { removeUserPresences } from "../moco/presences";
import { createMultipleUserSchedules } from "../moco/schedules";
import { MocoUserType } from "../moco/types/moco-types";
import { findUserBySlackCommand, findUserBySlackIdentity, getUsers } from "../moco/users";
import { SickNoteRequestedEvent } from "../slack/interaction-handler";
import { getSlackUserProfile, slackChatPostMessage } from "../slack/slack";

const USER_NOT_FOUND_MESSAGE =
  "Wir konnten deinen aktuellen Benutzer nicht in Moco finden. Prüfe deinen Benutzernamen und setze im Zweifel manuell deine SlackID in Moco";

export const eventHandler = async (event: SickNoteRequestedEvent) => {
  console.log(`Handling event ${JSON.stringify(event)}`);
  const users = await getUsers();
  const user = await findMocoUser(users, event);
  const generalChannel = process.env.GENERAL_CHANNEL;

  if (!user) {
    console.error(
      `Could not find Moco user for Slack user ${event.userId} (${event.userName}). Set SlackId in Moco if the automatic matching fails.`,
    );
    await axios.post(event.responseUrl, {
      replace_original: "true",
      text: USER_NOT_FOUND_MESSAGE,
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

async function findMocoUser(users: MocoUserType[], detail: SickNoteRequestedEvent): Promise<MocoUserType | undefined> {
  const user = findUserBySlackCommand({
    user_id: detail.userId,
    user_name: detail.userName,
  })(users);

  if (user) return user;

  try {
    const profile = await getSlackUserProfile(detail.userId);

    return findUserBySlackIdentity(users, {
      user_id: detail.userId,
      user_name: detail.userName,
      user_email: profile.profile?.email,
      real_name: profile.profile?.real_name,
      display_name: profile.profile?.display_name,
    });
  } catch (error) {
    console.error("Could not load Slack user profile for Moco user matching", error);
    return undefined;
  }
}
