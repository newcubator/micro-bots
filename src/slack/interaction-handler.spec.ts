import { encode } from "querystring";
import { eventBridgeSend } from "../clients/event-bridge";
import { interactionHandler } from "./interaction-handler";
import axios from "axios";
import { ActionType } from "./types/slack-types";

jest.mock("../clients/event-bridge");
const eventBridgeSendMock = eventBridgeSend as jest.Mock;
const axiosPostMock = axios.post as jest.Mock;

const samplePayload = {
  body: encode({
    payload: JSON.stringify({
      type: "block_actions",
      container: {
        message_ts: "1633540187.000600",
        channel_id: "C02BBA8DWVD",
      },
      response_url: "https://slack.com/response_url",
      actions: [
        {
          selected_option: {
            value: "project-01",
            text: {
              text: "Mars Cultivation Season Manager",
            },
          },
          action_id: ActionType.COMPLETION_NOTICE,
        },
      ],
    }),
  }),
} as any;

it("handle interaction", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});

  const result = await interactionHandler(samplePayload);

  expect(eventBridgeSendMock).toHaveBeenCalledWith({
    projectId: "project-01",
    projectName: "Mars Cultivation Season Manager",
    responseUrl: "https://slack.com/response_url",
    channelId: "C02BBA8DWVD",
    messageTs: "1633540187.000600",
    actionId: ActionType.COMPLETION_NOTICE,
  });
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
  });
  expect(result.statusCode).toBe(200);
});

it("throw error when unable to send event", async () => {
  eventBridgeSendMock.mockRejectedValueOnce(new Error("some error"));

  expect(interactionHandler(samplePayload)).rejects.toThrow("some error");
});

it("throw error when unable to respond in slack", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});
  axiosPostMock.mockRejectedValueOnce(new Error("some error"));

  expect(interactionHandler(samplePayload)).rejects.toThrow("some error");
});
