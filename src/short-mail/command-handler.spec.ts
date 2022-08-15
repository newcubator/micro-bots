import { getContacts } from "../moco/contacts";
import { commandHandler } from "./command-handler";

jest.mock("../moco/contacts");
const getContactsMock = getContacts as jest.Mock;

test("command handler short mail", async () => {
  getContactsMock.mockResolvedValueOnce([
    {
      id: 2,
      gender: "H",
      firstname: "Elon",
      lastname: "Musk",
      work_address: "Twittermarket 1",
    },
    {
      id: 2,
      gender: "H",
      firstname: "Should be filtered out because of missing address",
      lastname: "Gates",
      work_address: "",
    },
    {
      id: 2,
      gender: "H",
      firstname: "Steve",
      lastname: "Jobs",
      work_address: "Apfelallee 42",
    },
  ]);

  let result = await commandHandler({} as any);
  expect(getContactsMock).toHaveBeenCalled();
  expect(result.statusCode).toBe(200);
  expect(result.body).toMatchSnapshot();
});

test("respond when loads no contacts", async () => {
  getContactsMock.mockResolvedValueOnce([]);
  let result = await commandHandler({} as any);
  expect(result.statusCode).toBe(200);
  expect(result.body).toMatchSnapshot();
});
