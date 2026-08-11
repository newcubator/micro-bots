import { createVacationHandoverMessages } from "../vacation-handover/create-vacation-handover-messages";

export const handler = async () => {
  const vacationHandoverChannelId = process.env.VACATION_HANDOVER_CHANNEL_ID;

  if (typeof vacationHandoverChannelId === "undefined") {
    throw new Error("Keine Slack-Channel-ID für Urlaubsübergaben angegeben!");
  }

  await createVacationHandoverMessages(vacationHandoverChannelId);
};
