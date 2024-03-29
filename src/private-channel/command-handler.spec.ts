import { commandHandler } from "./command-handler";

test("command handler for short mail", async () => {
  const result = await commandHandler();
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toMatchSnapshot();
});
