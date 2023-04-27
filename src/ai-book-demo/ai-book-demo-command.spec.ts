import { commandHandler } from "./ai-book-demo-command";

test("command handler", async () => {
  const result = await commandHandler({} as any);
  expect(result.statusCode).toBe(200);
  expect(result.body).toMatchSnapshot();
});
