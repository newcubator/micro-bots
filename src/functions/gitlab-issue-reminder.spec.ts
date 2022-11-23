import axios from "axios";
import MockDate from "mockdate";
import { slackClient } from "../clients/slack";
import { handler } from "./gitlab-issue-reminder";

MockDate.set("2021-12-31");

const axiosGetMock = axios.get as jest.Mock;
const slackPostMessageMock = slackClient.chat.postMessage as jest.Mock;

describe("gitlab-issue-reminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    process.env.GITLAB_PROJECT_ID = "1";
    process.env.SLACK_CHANNEL_ID = "1";
  });

  it("send a reminder for due issue", async () => {
    axiosGetMock.mockReturnValueOnce({
      data: [
        {
          due_date: "2021-12-31",
          title: "Im due today",
          web_url: "https://gitlab.test/issue/1",
        },
        {
          due_date: "2022-01-01",
          title: "Im not due today",
          web_url: "https://gitlab.test/issue/2",
        },
      ],
    });

    await handler();

    expect(axiosGetMock).toHaveBeenCalledWith("https://gitlab.com/api/v4/projects/1/issues", {
      headers: expect.anything(),
      params: {
        due_date: "week",
        state: "opened",
      },
    });

    expect(slackPostMessageMock).toHaveBeenCalledWith({
      channel: "1",
      text: "⚠️ Das Ticket <https://gitlab.test/issue/1|Im due today> ist heute fällig!",
    });
  });

  it("send no reminder when no due issues found", async () => {
    axiosGetMock.mockReturnValueOnce({
      data: [],
    });

    await handler();

    expect(slackPostMessageMock).toHaveBeenCalledTimes(0);
  });

  it("handle error on posting messages", async () => {
    axiosGetMock.mockReturnValueOnce({
      data: [
        {
          due_date: "2021-12-31",
          title: "Im due today",
          web_url: "https://gitlab.test/issue/1",
        },
        {
          due_date: "2021-12-31",
          title: "Im due today aswell",
          web_url: "https://gitlab.test/issue/2",
        },
      ],
    });

    slackPostMessageMock.mockRejectedValueOnce({});

    await handler();

    expect(slackPostMessageMock).toHaveBeenCalledTimes(2);
  });
});
