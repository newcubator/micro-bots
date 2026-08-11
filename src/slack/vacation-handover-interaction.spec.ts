import axios from "axios";
import { encode } from "querystring";
import { interactionHandler } from "./interaction-handler";
import {
  createVacationHandoverChecklistBlocks,
  VACATION_HANDOVER_CHECKLIST_ACTION,
} from "../vacation-handover/checklist";

jest.mock("axios");
jest.mock("../background/dispatch");

const axiosPostMock = axios.post as jest.Mock;

describe("vacation-handover checklist interaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("checks a checklist item in the Slack thread", async () => {
    const result = await interactionHandler({
      body: encode({
        payload: JSON.stringify({
          type: "block_actions",
          container: { message_ts: "1633540187.000601", channel_id: "C0123456789" },
          channel: { id: "C0123456789", name: "urlaubsübergaben" },
          response_url: "https://slack.com/response_url",
          message: { blocks: createVacationHandoverChecklistBlocks() },
          actions: [{ action_id: VACATION_HANDOVER_CHECKLIST_ACTION, value: "open-tasks" }],
        }),
      }),
    });

    expect(result.statusCode).toBe(200);
    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: "Urlaubsübergabe-Checkliste aktualisiert",
      blocks: expect.arrayContaining([
        expect.objectContaining({
          type: "actions",
          elements: expect.arrayContaining([
            expect.objectContaining({
              value: "open-tasks",
              text: expect.objectContaining({ text: "☑ Offene Aufgaben und Fristen klären" }),
            }),
          ]),
        }),
      ]),
    });
  });
});
