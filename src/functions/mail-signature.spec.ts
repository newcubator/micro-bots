import { encode } from "querystring";
import { getUsers } from "../moco/users";
import { ActionType, MailSignatureFields } from "../slack/types/slack-types";
import { handler, SignatureType } from "./mail-signature";

jest.mock("../moco/users", () => ({
  ...jest.requireActual("../moco/users"),
  getUsers: jest.fn(),
}));

const getUsersMock = getUsers as jest.Mock;

test("returns selectors for signature type and job title", async () => {
  getUsersMock.mockResolvedValueOnce([
    {
      firstname: "Max",
      lastname: "Mustermann",
      email: "max.mustermann@newcubator.com",
      custom_properties: {
        SlackId: "U0113HJ8N2Z",
        ["Job Bezeichnung"]: "Software Engineer",
      },
    },
    {
      firstname: "Ada",
      lastname: "Lovelace",
      email: "ada.lovelace@newcubator.com",
      custom_properties: {
        ["Job Bezeichnung"]: "Product Owner",
      },
    },
  ]);

  const result = await handler({
    body: encode({ user_id: "U0113HJ8N2Z", user_name: "max.mustermann" }),
  });
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(200);
  expect(body.response_type).toBe("ephemeral");
  expect(body.blocks[0].block_id).toBe(MailSignatureFields.MAIL_SIGNATURE_TYPE);
  expect(body.blocks[0].element.initial_option.value).toBe(SignatureType.NEWCUBATOR);
  expect(body.blocks[0].element.options.map((option: { value: string }) => option.value)).toEqual([
    SignatureType.NEWCUBATOR,
    SignatureType.STADTQUEST,
  ]);
  expect(body.blocks[1].block_id).toBe(MailSignatureFields.MAIL_SIGNATURE_JOB_TITLE);
  expect(body.blocks[1].element.initial_option.value).toBe("Software Engineer");
  expect(body.blocks[1].element.options.map((option: { value: string }) => option.value)).toEqual([
    "Software Engineer",
    "Product Owner",
  ]);
  expect(body.blocks[2].elements[0].action_id).toBe(ActionType.MAIL_SIGNATURE);
});
