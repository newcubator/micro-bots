import { SlackBlock } from "../slack/types/slack-types";

export const VACATION_HANDOVER_CHECKLIST_ACTION = "VACATION_HANDOVER_CHECKLIST";
export const VACATION_HANDOVER_CHECKLIST_BLOCK = "vacation-handover-checklist";

export const VACATION_HANDOVER_CHECKLIST_ITEMS = [
  { id: "open-tasks", label: "Aufgaben und Fristen geklärt" },
  { id: "representation", label: "Vertretung geklärt" },
  { id: "appointments", label: "Termine und Kontakte übergeben" },
  { id: "documents", label: "Dokumente und Links geteilt" },
  { id: "pliant-invoices", label: "Pliant-Rechnungen hochgeladen" },
  { id: "working-times", label: "Arbeitszeiten erfasst" },
  { id: "email-absence", label: "E-Mail-Abwesenheit eingetragen" },
  { id: "next-steps", label: "Rückkehr-Schritte festgehalten" },
] as const;

export const createVacationHandoverChecklistActionId = (itemId: string) =>
  `${VACATION_HANDOVER_CHECKLIST_ACTION}:${itemId}`;

export const createVacationHandoverChecklistBlocks = (
  completedItemIds: ReadonlySet<string> = new Set(),
): SlackBlock[] => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Bitte im Thread kurz klären und anschließend abhaken:*",
    },
  },
  {
    type: "actions",
    block_id: VACATION_HANDOVER_CHECKLIST_BLOCK,
    elements: VACATION_HANDOVER_CHECKLIST_ITEMS.map((item) => ({
      type: "button",
      action_id: createVacationHandoverChecklistActionId(item.id),
      value: item.id,
      text: {
        type: "plain_text",
        text: `${completedItemIds.has(item.id) ? "☑" : "☐"} ${item.label}`,
        emoji: true,
      },
      ...(completedItemIds.has(item.id) ? { style: "primary" } : {}),
    })),
  },
];

export const getCompletedVacationHandoverItemIds = (blocks: unknown[] | undefined): Set<string> => {
  const completedItemIds = new Set<string>();

  for (const block of blocks ?? []) {
    if (!isRecord(block) || block.block_id !== VACATION_HANDOVER_CHECKLIST_BLOCK || !Array.isArray(block.elements)) {
      continue;
    }

    for (const element of block.elements) {
      if (
        !isRecord(element) ||
        typeof element.action_id !== "string" ||
        !element.action_id.startsWith(`${VACATION_HANDOVER_CHECKLIST_ACTION}:`)
      ) {
        continue;
      }

      const text = isRecord(element.text) && typeof element.text.text === "string" ? element.text.text : "";
      if (text.startsWith("☑") && typeof element.value === "string") {
        completedItemIds.add(element.value);
      }
    }
  }

  return completedItemIds;
};

const isRecord = (value: unknown): value is Record<string, any> => typeof value === "object" && value !== null;
