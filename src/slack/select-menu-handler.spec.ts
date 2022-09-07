import { encode } from "querystring";

jest.mock("../moco/users", () => ({
  getUsers: jest.fn().mockResolvedValue([
    {
      id: 2,
      gender: "H",
      firstname: "Bill",
      lastname: "Musk",
      work_address: "Twittermarket 1",
    },
  ]),
}));

jest.mock("../moco/contacts", () => ({
  getAllContacts: jest.fn().mockResolvedValue([
    {
      id: 3,
      gender: "H",
      firstname: "Bill",
      lastname: "Gates",
      work_address: "",
    },
    {
      id: 4,
      gender: "H",
      firstname: "Should be filtered out",
      lastname: "Jobs",
      work_address: "Apfelallee 42",
    },
  ]),
}));

import { selectMenuHandler } from "./select-menu-handler";

const samplePayload1 = {
  body: encode({
    payload: JSON.stringify({
      type: "block_suggestion",
      container: {
        message_ts: "1633540187.000600",
        channel_id: "C02BBA8DWVD",
      },
      channel: { id: "C02BBA8DWVD", name: "testchannel" },
      response_url: "https://slack.com/response_url",
      action_id: "SHORT_MAIL_RECIPIENT",
      block_id: "SHORT_MAIL_RECIPIENT",
      value: "Bill",
    }),
  }),
} as any;

const samplePayload1Result =
  '{"options":[{"value":"3","text":{"type":"plain_text","text":"Bill Gates","emoji":true}},{"value":"2","text":{"type":"plain_text","text":"Bill Musk","emoji":true}}]}';

it("handle interaction with correct action type", async () => {
  const result = await selectMenuHandler(samplePayload1);

  expect(result.statusCode).toBe(200);
  expect(result.body).toBe(samplePayload1Result);
});
