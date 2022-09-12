import { getContacts } from "../moco/contacts";
import { commandHandler } from "./command-handler";

jest.mock("../moco/contacts");
const getContactsMock = getContacts as jest.Mock;

test("command handler for short mail", async () => {
  let result = await commandHandler({} as any);
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toMatchSnapshot();
});

test("respond when loads no contacts", async () => {
  getContactsMock.mockResolvedValueOnce([]);
  let result = await commandHandler({} as any);
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toMatchSnapshot();
});
