import axios from "axios";
import MockDate from "mockdate";
import { slackClient } from "../clients/slack";
import { handler } from "./gitlab-issue-reminder";

MockDate.set("2021-12-31");

global.console = { log: jest.fn() } as unknown as Console;

it("should send a reminder for due issue", async () => {
  (axios.get as jest.Mock)
    .mockReturnValueOnce({
      data: {
        name: "im-a-cool-project",
      },
    })
    .mockReturnValueOnce({
      data: [
        {
          title: "Im an issue",
          due_date: "2021-12-31",
        },
      ],
    });

  await handler();

  expect(slackClient.chat.postMessage as jest.Mock).toHaveBeenCalledWith({
    channel: "1111111",
    text: "Das Issue 'Im an issue' aus dem Projekt 'im-a-cool-project' ist heute fällig!",
    username: "Micro Bots",
  });
});

it("should not send a reminder", async () => {
  (axios.get as jest.Mock)
    .mockReturnValueOnce({
      data: {
        name: "im-a-cool-project",
      },
    })
    .mockReturnValueOnce({
      data: [
        {
          title: "Im an issue",
          due_date: "2022-01-01",
        },
      ],
    });

  await handler();

  expect(console.log as jest.Mock).toHaveBeenCalledWith("No due issues were found for 2021-12-31");

  expect(slackClient.chat.postMessage as jest.Mock).not.toHaveBeenCalled();
});
