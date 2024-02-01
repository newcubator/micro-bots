import { commandHandler } from "./command-handler";

test("command handler for sick note", async () => {
  const result = await commandHandler({} as any);
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toMatchSnapshot();
});
