import { encode } from "querystring";
import { eventBridgeSend } from "../clients/event-bridge";
import { interactionHandler } from "./interaction-handler";
import axios from "axios";
import { ActionType } from "./types/slack-types";

jest.mock("../clients/event-bridge");
const eventBridgeSendMock = eventBridgeSend as jest.Mock;
const axiosPostMock = axios.post as jest.Mock;

const samplePayload1 = {
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

const samplePayload2 = {
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
          action_id: ActionType.LOCK_PROJECT,
        },
      ],
    }),
  }),
} as any;

const samplePayload3 = {
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
          action_id: ActionType.UNLOCK_PROJECT,
        },
      ],
    }),
  }),
} as any;

const samplePayload4 = {
  body: encode({
    payload: JSON.stringify({
      type: "block_actions",
      user: {
        id: "1",
        username: "max.mustermann",
        name: "max.mustermann",
      },
      container: {
        message_ts: "1633540187.000600",
        channel_id: "C02BBA8DWVD",
      },
      state: {
        values: {
          SHORT_MAIL_RECIPIENT: {
            SHORT_MAIL_RECIPIENT: {
              type: "static_select",
              selected_option: {
                value: "1",
                text: {
                  text: "Bill Gates",
                },
              },
            },
          },
          SHORT_MAIL_TEXT: { SHORT_MAIL_TEXT: { type: "plain_text_input", value: "Testnachricht an Bill" } },
          SHORT_MAIL_LOCATION: {
            SHORT_MAIL_LOCATION: {
              type: "static_select",
              selected_option: {
                value: "D",
                text: {
                  text: "Dortmund",
                },
              },
            },
          },
        },
      },
      response_url: "https://slack.com/response_url",
      actions: [
        {
          action_id: "SHORT_MAIL",
          block_id: "confirmationButton",
          text: [Object],
          value: "Confirmation",
          style: "primary",
          type: "button",
        },
      ],
    }),
  }),
} as any;

it("handle interaction", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});

  const result = await interactionHandler(samplePayload1);

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

it("handle interaction", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});

  const result = await interactionHandler(samplePayload2);

  expect(eventBridgeSendMock).toHaveBeenCalledWith({
    projectId: "project-01",
    projectName: "Mars Cultivation Season Manager",
    responseUrl: "https://slack.com/response_url",
    channelId: "C02BBA8DWVD",
    messageTs: "1633540187.000600",
    actionId: ActionType.LOCK_PROJECT,
  });
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
  });
  expect(result.statusCode).toBe(200);
});

it("handle interaction", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});

  const result = await interactionHandler(samplePayload3);

  expect(eventBridgeSendMock).toHaveBeenCalledWith({
    projectId: "project-01",
    projectName: "Mars Cultivation Season Manager",
    responseUrl: "https://slack.com/response_url",
    channelId: "C02BBA8DWVD",
    messageTs: "1633540187.000600",
    actionId: ActionType.UNLOCK_PROJECT,
  });
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
  });
  expect(result.statusCode).toBe(200);
});

it("handle interaction short mail", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});

  const result = await interactionHandler(samplePayload4);

  expect(eventBridgeSendMock).toHaveBeenCalledWith({
    channelId: "C02BBA8DWVD",
    messageTs: "1633540187.000600",
    responseUrl: "https://slack.com/response_url",
    personId: "1",
    personName: "Bill Gates",
    message: "Testnachricht an Bill",
    sender: "max.mustermann",
    location: "D",
    actionId: ActionType.SHORT_MAIL,
  });
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
  });
  expect(result.statusCode).toBe(200);
});

it("throw error when unable to send event", async () => {
  eventBridgeSendMock.mockRejectedValueOnce(new Error("some error"));

  expect(interactionHandler(samplePayload1)).rejects.toThrow("some error");
});

it("throw error when unable to respond in slack", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});
  axiosPostMock.mockRejectedValueOnce(new Error("some error"));

  expect(interactionHandler(samplePayload1)).rejects.toThrow("some error");
});
