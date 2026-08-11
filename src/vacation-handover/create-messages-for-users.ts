import dayjs from "dayjs";
import { getSlackUsers, slackChatPostMessage, slackConversationsReplies } from "../slack/slack";
import { Member, SlackHistoryMessage } from "../slack/types/slack-types";
import { MocoUserType } from "../moco/types/moco-types";
import { UserWithVacations } from "./get-users-with-start-and-end-date";
import { createVacationHandoverChecklistBlocks, VACATION_HANDOVER_CHECKLIST_BLOCK } from "./checklist";

export const createMessagesForUsers = async (
  channelId: string,
  users: UserWithVacations[],
  existingMessages: SlackHistoryMessage[],
) => {
  let slackUsersByEmail: Map<string, Member> | undefined;
  const getSlackUsersByEmail = async () => {
    slackUsersByEmail = slackUsersByEmail ?? (await createSlackUsersByEmail());
    return slackUsersByEmail;
  };

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
    const employeeMention = await createEmployeeMention(user.user, employeeName, getSlackUsersByEmail);
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

    await createChecklistThreadMessage(channelId, messageTs);

    existingMessages.push({ text: `${handoverId} Urlaubsübergabe ${employeeName}`, ts: messageTs });
    console.log(`Urlaubsübergabe für ${employeeName} wurde in Slack erstellt`);
  }
};

const createChecklistThreadMessage = async (channelId: string, messageTs: string) =>
  slackChatPostMessage(
    "Bitte kurz im Thread ergänzen, was zu klären ist. Die Punkte können nach der Klärung direkt abgehakt werden.",
    channelId,
    "Urlaubsübergabe",
    ":palm_tree:",
    {
      blocks: createVacationHandoverChecklistBlocks(),
      threadTs: messageTs,
    },
  );

const hasVacationHandoverChecklist = (message: SlackHistoryMessage) =>
  message.blocks?.some((block) => block.block_id === VACATION_HANDOVER_CHECKLIST_BLOCK) ?? false;

const createEmployeeMention = async (
  user: MocoUserType,
  fallbackName: string,
  getSlackUsersByEmail: () => Promise<ReadonlyMap<string, Member>>,
) => {
  const slackId = trimString(user.custom_properties?.SlackId);
  if (slackId) return `<@${slackId}>`;

  const slackUsersByEmail = await getSlackUsersByEmail();
  const slackUser = slackUsersByEmail.get(normalizeEmail(user.email) ?? "");
  return slackUser ? `<@${slackUser.id}>` : fallbackName;
};

const createSlackUsersByEmail = async () => {
  try {
    const slackUsers = await getSlackUsers();
    return new Map<string, Member>(
      slackUsers.members.flatMap((member) => {
        const email = normalizeEmail(member.profile.email);
        return email ? [[email, member]] : [];
      }),
    );
  } catch (error) {
    console.error("Could not load Slack users for vacation handover mentions", error);
    return new Map<string, Member>();
  }
};

const trimString = (value: unknown) => (typeof value === "string" ? value.trim() : undefined);

const normalizeEmail = (value: unknown) => trimString(value)?.toLowerCase();
