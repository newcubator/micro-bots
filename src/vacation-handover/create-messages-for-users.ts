import dayjs from "dayjs";
import { slackChatPostMessage, slackConversationsReplies } from "../slack/slack";
import { SlackHistoryMessage } from "../slack/types/slack-types";
import { UserWithVacations } from "./get-users-with-start-and-end-date";
import {
  createVacationHandoverChecklistBlocks,
  VACATION_HANDOVER_CHECKLIST_BLOCK,
  VACATION_HANDOVER_THREAD_TEXT,
} from "./checklist";

const VACATION_HANDOVER_ICON = ":desert_island:";

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
    const existingMessage = existingMessages.find((message) => message.text?.includes(handoverId));

    if (existingMessage) {
      const replies = await slackConversationsReplies(channelId, existingMessage.ts);
      if (replies.some(hasVacationHandoverChecklist)) {
        console.log(`Urlaubsübergabe für ${user.user.firstname} wurde bereits erstellt`);
        continue;
      }

      await createChecklistThreadMessage(channelId, existingMessage.ts);
      console.log(`Checkliste für bestehende Urlaubsübergabe von ${user.user.firstname} wurde in Slack erstellt`);
      continue;
    }

    const employeeName = `${user.user.firstname} ${user.user.lastname}`;
    const slackId = user.user.custom_properties?.SlackId;
    const employeeMention = typeof slackId === "string" ? `<@${slackId}>` : employeeName;
    const mainMessage = await slackChatPostMessage(
      `${handoverId} Urlaubsübergabe ${employeeName} (${startDateFormatted} – ${endDateFormatted})`,
      channelId,
      "Urlaubsübergabe",
      VACATION_HANDOVER_ICON,
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

    await createChecklistThreadMessage(channelId, messageTs);

    existingMessages.push({ text: `${handoverId} Urlaubsübergabe ${employeeName}`, ts: messageTs });
    console.log(`Urlaubsübergabe für ${employeeName} wurde in Slack erstellt`);
  }
};

const createChecklistThreadMessage = async (channelId: string, messageTs: string) =>
  slackChatPostMessage(VACATION_HANDOVER_THREAD_TEXT, channelId, "Urlaubsübergabe", VACATION_HANDOVER_ICON, {
    blocks: createVacationHandoverChecklistBlocks(),
    threadTs: messageTs,
  });

const hasVacationHandoverChecklist = (message: SlackHistoryMessage) =>
  message.blocks?.some((block) => block.block_id === VACATION_HANDOVER_CHECKLIST_BLOCK) ?? false;
