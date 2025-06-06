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
      channel: { id: "C02BBA8DWVD", name: "testchannel" },
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
      channel: { id: "C02BBA8DWVD", name: "testchannel" },
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
      channel: { id: "C02BBA8DWVD", name: "testchannel" },
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
        id: "maxMustermannId",
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
          SHORT_MAIL_SENDER: { SHORT_MAIL_SENDER: { selected_user: "maxMustermannId" } },
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
      channel: { id: "C02BBA8DWVD", name: "testchannel" },
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

const samplePayload5 = {
  body: encode({
    payload: JSON.stringify({
      type: "block_actions",
      user: {
        id: "maxMustermannId2",
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
      channel: { id: "C02BBA8DWVD", name: "testchannel" },
      response_url: "https://slack.com/response_url",
      actions: [
        {
          action_id: "SHORT_MAIL_DROPDOWN",
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

const samplePayload6 = {
  body: encode({
    payload: JSON.stringify({
      type: "block_actions",
      container: {
        message_ts: "1633540187.000600",
        channel_id: "C02BBA8DWVD",
      },
      channel: { id: "C02BBA8DWVD", name: "privategroup" },
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

const samplePayload7 = {
  body: encode({
    payload: JSON.stringify({
      type: "block_actions",
      container: {
        message_ts: "1633540187.000600",
        channel_id: "C02BBA8DWVD",
      },
      channel: { id: "C02BBA8DWVD", name: "privategroup" },
      response_url: "https://slack.com/response_url",
      state: {
        values: {
          PRIVATE_CHANNEL_USERS: {
            PRIVATE_CHANNEL_USERS: {
              selected_users: ["1", "2"],
            },
          },
          PRIVATE_CHANNEL_NAME: { PRIVATE_CHANNEL_NAME: { value: "Testchannel" } },
        },
      },
      actions: [
        {
          action_id: "PRIVATE_CHANNEL",
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

const samplePayload8 = {
  body: encode({
    payload: JSON.stringify({
      type: "block_actions",
      container: {
        message_ts: "1633540187.000600",
        channel_id: "C02BBA8DWVD",
      },
      channel: { id: "C02BBA8DWVD", name: "privategroup" },
      response_url: "https://slack.com/response_url",
      state: {
        values: {
          PRIVATE_CHANNEL_USERS: {
            PRIVATE_CHANNEL_USERS: {
              selected_users: ["1", "2"],
            },
          },
          PRIVATE_CHANNEL_NAME: { PRIVATE_CHANNEL_NAME: { value: "Testchannel" } },
        },
      },
      actions: [
        {
          action_id: "CANCEL",
          block_id: "uploadButton",
          text: [Object],
          style: "danger",
          type: "button",
        },
      ],
    }),
  }),
} as any;

const samplePayload11 = {
  body: encode({
    payload: JSON.stringify({
      type: "block_actions",
      user: {
        id: "U02CYDKCPNH",
        username: "lars.silberg",
        name: "lars.silberg",
        team_id: "T1G4GKUTV",
      },
      api_app_id: "A02",
      token: "Shh_its_a_seekrit",
      container: {
        type: "message",
        text: "The contents of the original message where the action originated",
        channel_id: "C02BBA8DWVD",
      },
      trigger_id: "12466734323.1395872398",
      team: {
        id: "T1G4GKUTV",
        domain: "newcubator",
      },
      enterprise: null,
      is_enterprise_install: false,
      state: {
        values: {
          radio_buttons_days: {
            radio_buttons_action: {
              selected_option: {
                value: "single-day",
              },
            },
          },
          dates: {
            start_date: {
              selected_date: null,
            },
            end_date: {
              selected_date: null,
            },
          },
        },
      },
      channel: { id: "C02BBA8DWVD", name: "testchannel" },
      response_url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
      actions: [
        {
          type: "plain_text_input",
          block_id: "SICK_NOTE",
          action_id: "SICK_NOTE",
          value: "Confirmation",
          action_ts: "1682508333.733822",
        },
      ],
    }),
  }),
} as any;

const samplePayload12 = {
  body: encode({
    payload: JSON.stringify({
      type: "block_actions",
      user: {
        id: "U02CYDKCPNH",
        username: "lars.silberg",
        name: "lars.silberg",
        team_id: "T1G4GKUTV",
      },
      api_app_id: "A02",
      token: "Shh_its_a_seekrit",
      container: {
        type: "message",
        text: "The contents of the original message where the action originated",
        channel_id: "C02BBA8DWVD",
      },
      trigger_id: "12466734323.1395872398",
      team: {
        id: "T1G4GKUTV",
        domain: "newcubator",
      },
      enterprise: null,
      is_enterprise_install: false,
      state: {
        values: {
          radio_buttons_days: {
            radio_buttons_action: {
              selected_option: {
                value: "multiple-days",
              },
            },
          },
          dates: {
            start_date: {
              selected_date: "2021-10-06",
            },
            end_date: {
              selected_date: "2021-10-10",
            },
          },
        },
      },
      channel: { id: "C02BBA8DWVD", name: "testchannel" },
      response_url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
      actions: [
        {
          type: "plain_text_input",
          block_id: "SICK_NOTE",
          action_id: "SICK_NOTE",
          value: "Confirmation",
          action_ts: "1682508333.733822",
        },
      ],
    }),
  }),
} as any;

it("handle interaction with wrong action type", async () => {
  const result = await interactionHandler(samplePayload5);
  expect(eventBridgeSendMock).toHaveBeenCalledTimes(0);
  expect(result.statusCode).toBe(200);
});

it("handle upload command in private channel", async () => {
  const result = await interactionHandler(samplePayload6);
  expect(eventBridgeSendMock).toHaveBeenCalledTimes(0);
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: "Vielen Dank für deine Anfrage, ich kann das leider nicht in einem privaten Channel tun, bitte gehe dazu in einen öffentlichen Channel.",
  });
  expect(result.statusCode).toBe(200);
});

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

it("handle interaction for locking a project", async () => {
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

it("handle interaction for sick note for single day", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});

  const result = await interactionHandler(samplePayload11);

  expect(eventBridgeSendMock).toHaveBeenCalledWith({
    channelId: "C02BBA8DWVD",
    actionType: ActionType.SICK_NOTE,
    responseUrl: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    forSingleDay: true,
    startDay: null,
    endDay: null,
    userId: "U02CYDKCPNH",
    userName: "lars.silberg",
  });
  expect(axiosPostMock).toHaveBeenCalledWith(
    "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    {
      replace_original: "true",
      text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
    },
  );
  expect(result.statusCode).toBe(200);
});

it("handle interaction for sick note for multiple days", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});

  const result = await interactionHandler(samplePayload12);

  expect(eventBridgeSendMock).toHaveBeenCalledWith({
    channelId: "C02BBA8DWVD",
    actionType: ActionType.SICK_NOTE,
    responseUrl: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    forSingleDay: false,
    startDay: "2021-10-06",
    endDay: "2021-10-10",
    userId: "U02CYDKCPNH",
    userName: "lars.silberg",
  });
  expect(axiosPostMock).toHaveBeenCalledWith(
    "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    {
      replace_original: "true",
      text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
    },
  );
  expect(result.statusCode).toBe(200);
});

it("handle interaction for unlocking a project", async () => {
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

it("handle interaction short mail with text", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});

  const result = await interactionHandler(samplePayload4);

  expect(eventBridgeSendMock).toHaveBeenCalledWith({
    channelId: "C02BBA8DWVD",
    messageTs: "1633540187.000600",
    responseUrl: "https://slack.com/response_url",
    personId: "1",
    personName: "Bill Gates",
    message: "Testnachricht an Bill",
    sender: "maxMustermannId",
    location: "D",
    actionId: ActionType.SHORT_MAIL,
  });
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
  });
  expect(result.statusCode).toBe(200);
});

it("should cancel interaction", async () => {
  const result = await interactionHandler(samplePayload8);

  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: "Der Brief wird nicht verschickt.",
  });
  expect(result.statusCode).toBe(200);
});

it("handle interaction private channel", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});

  const result = await interactionHandler(samplePayload7);

  expect(eventBridgeSendMock).toHaveBeenCalledWith({
    channelId: "C02BBA8DWVD",
    messageTs: "1633540187.000600",
    responseUrl: "https://slack.com/response_url",
    personId: ["1", "2"],
    channelName: "Testchannel",
    actionId: ActionType.PRIVATE_CHANNEL,
  });
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
  });
  expect(result.statusCode).toBe(200);
});

it("throw error when unable to send event", async () => {
  eventBridgeSendMock.mockRejectedValueOnce(new Error("some error"));

  await expect(interactionHandler(samplePayload1)).rejects.toThrow("some error");
});

it("throw error when unable to respond in slack", async () => {
  eventBridgeSendMock.mockResolvedValueOnce({});
  axiosPostMock.mockRejectedValueOnce(new Error("some error"));

  await expect(interactionHandler(samplePayload1)).rejects.toThrow("some error");
});
