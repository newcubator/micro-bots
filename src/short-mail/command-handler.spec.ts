import { getContacts } from "../moco/contacts";
import { commandHandler } from "./command-handler";

jest.mock("../moco/contacts");
const getContactsMock = getContacts as jest.Mock;

test("command handler for short mail", async () => {
  const result = await commandHandler({} as any);
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toMatchSnapshot();
});

test("respond when loads no contacts", async () => {
  getContactsMock.mockResolvedValueOnce([]);
  const result = await commandHandler({} as any);
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toMatchSnapshot();
});

test("set default sender to user sending the command", async () => {
  const event = {
    body: "user_id=1",
  };
  const result = await commandHandler(event as any);
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body).blocks[3].element.initial_user).toBe("1");
});
