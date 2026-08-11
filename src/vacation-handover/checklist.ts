import { SlackBlock } from "../slack/types/slack-types";

export const VACATION_HANDOVER_CHECKLIST_ACTION = "VACATION_HANDOVER_CHECKLIST";
export const VACATION_HANDOVER_CHECKLIST_BLOCK = "vacation-handover-checklist";

export const VACATION_HANDOVER_CHECKLIST_ITEMS = [
  { id: "open-tasks", label: "Offene Aufgaben und Fristen klären" },
  { id: "representation", label: "Vertretung und Zuständigkeiten klären" },
  { id: "appointments", label: "Termine und wichtige Kontakte übergeben" },
  { id: "documents", label: "Relevante Dokumente und Links teilen" },
  { id: "next-steps", label: "Nächste Schritte nach der Rückkehr festhalten" },
] as const;

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
      action_id: VACATION_HANDOVER_CHECKLIST_ACTION,
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
      if (!isRecord(element) || element.action_id !== VACATION_HANDOVER_CHECKLIST_ACTION) {
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
