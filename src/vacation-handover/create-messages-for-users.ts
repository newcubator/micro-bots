import dayjs from "dayjs";
import { slackChatPostMessage } from "../slack/slack";
import { SlackHistoryMessage } from "../slack/types/slack-types";
import { UserWithVacations } from "./get-users-with-start-and-end-date";
import { createVacationHandoverChecklistBlocks } from "./checklist";

export const createMessagesForUsers = async (
  channelId: string,
  users: UserWithVacations[],
  existingMessages: SlackHistoryMessage[],
) => {
  for (const user of users) {
    const startDate = dayjs(user.dates[0]);
    const endDate = dayjs(user.dates[1]);
    const startDateFormatted = startDate.format("DD.MM.YYYY");
    const endDateFormatted = endDate.format("DD.MM.YYYY");
    const handoverId = `Urlaubsübergabe-ID:${user.user.id}:${user.dates[0]}:${user.dates[1]}`;

    if (existingMessages.some((message) => message.text?.includes(handoverId))) {
      console.log(`Urlaubsübergabe für ${user.user.firstname} wurde bereits erstellt`);
      continue;
    }

    const employeeName = `${user.user.firstname} ${user.user.lastname}`;
    const slackId = user.user.custom_properties?.SlackId;
    const employeeMention = typeof slackId === "string" ? `<@${slackId}>` : employeeName;
    const mainMessage = await slackChatPostMessage(
      `${handoverId} Urlaubsübergabe ${employeeName} (${startDateFormatted} – ${endDateFormatted})`,
      channelId,
      "Urlaubsübergabe",
      ":palm_tree:",
      {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Urlaubsübergabe: ${employeeName}`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${employeeMention} ist vom *${startDateFormatted} bis ${endDateFormatted}* im Urlaub.\nBitte die Übergabe im Thread kurz dokumentieren und die Punkte dort abhaken.`,
            },
          },
          {
            type: "context",
            elements: [{ type: "mrkdwn", text: handoverId }],
          },
        ],
      },
    );

    const messageTs = mainMessage.ts ?? mainMessage.message?.ts;
    if (!messageTs) {
      throw new Error(`Slack-Nachricht für die Urlaubsübergabe von ${employeeName} enthält keinen Zeitstempel`);
    }

    await slackChatPostMessage(
      "Bitte kurz im Thread ergänzen, was zu klären ist. Die Punkte können nach der Klärung direkt abgehakt werden.",
      channelId,
      "Urlaubsübergabe",
      ":palm_tree:",
      {
        blocks: createVacationHandoverChecklistBlocks(),
        threadTs: messageTs,
      },
    );

    existingMessages.push({ text: `${handoverId} Urlaubsübergabe ${employeeName}`, ts: messageTs });
    console.log(`Urlaubsübergabe für ${employeeName} wurde in Slack erstellt`);
  }
};
