import { eventHandler } from "./event-handler";
import { ActionType } from "../slack/types/slack-types";
import { getProject } from "../moco/projects";
import { getActivities } from "../moco/activities";
import { channelJoin } from "../slack/channel-join";
import axios from "axios";
import { getIssues } from "../kws-jira/issues";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dayjs from "dayjs";
import { uploadFileToSlackChannel } from "../slack/upload-file-to-slack-channel";

jest.mock("../moco/projects");
jest.mock("../moco/activities");
jest.mock("../kws-jira/issues");
jest.mock("../slack/channel-join");
jest.mock("../clients/slack");
jest.mock("axios");
jest.mock("../kws-jira/credentials", () => ({
  JIRA_PASSWORD_KWS: "test",
  JIRA_USER_KWS: "test",
}));
jest.mock("../slack/upload-file-to-slack-channel");

const uploadFileToSlackChannelMock = uploadFileToSlackChannel as jest.Mock;

describe("eventHandler", () => {
  it("should generate and upload an Excel report", async () => {
    // Mock the necessary dependencies and input data
    const projectId = 12345;
    const channelId = "67890";
    const event = {
      id: "event-id",
      version: "1.0",
      account: "aws-account",
      time: "2023-06-06T12:00:00Z",
      "detail-type": "KWSCsvExportRequestedEvent",
      source: "your-event-source",
      resources: [],
      region: "us-west-2",
      detail: {
        projectId: projectId.toString(),
        channelId,
        responseUrl: "https://example.com/response",
        projectName: "Your Project",
        messageTs: "message-timestamp",
        actionId: ActionType.KWS_EXCEL_EXPORT,
      },
    };

    // Mock the functions used within eventHandler
    (getProject as jest.Mock).mockResolvedValue({ id: projectId, created_at: "2023-06-01", name: "MikesProject" });
    (getActivities as jest.Mock).mockResolvedValue([
      [
        {
          project: { id: "project1" },
          task: { name: "task1" },
          tag: "key1",
          description: "description1",
          hours: 1.0,
          billable: true,
          date: "2023-06-01",
          user: { firstname: "John", lastname: "Doe" },
        },
        {
          project: { id: "project1" },
          task: { name: "task1" },
          tag: "key2",
          description: "description1",
          hours: 1.0,
          billable: true,
          date: "2023-06-01",
          user: { firstname: "John", lastname: "Doe" },
        },
      ],
    ]);
    (getIssues as jest.Mock).mockResolvedValue([
      // updated mock
      {
        id: "issue1",
        key: "key1",
        fields: {
          issuetype: {
            name: "issueType1",
          },
          customfield_10089: "orderReference1",
          customfield_10027: null,
          timeestimate: 28000,
          timetracking: { originalEstimate: "1w 3d" },
        },
      },
    ]);
    (channelJoin as jest.Mock).mockResolvedValue(undefined);
    uploadFileToSlackChannelMock.mockResolvedValue({ url_private: "https://example.com/file" });
    (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: {} });

    // Execute the event handler
    await eventHandler(event);

    // Verify the expected function calls
    expect(getProject).toHaveBeenCalledWith(projectId.toString());
    expect(getActivities).toHaveBeenCalledWith("2022-06-01", expect.any(String), projectId.toString());
    expect(channelJoin).toHaveBeenCalledWith(channelId);
    expect(uploadFileToSlackChannelMock).toHaveBeenCalledWith({
      channels: channelId,
      file: expect.any(Buffer),
      filename: `MikesProject_report_${dayjs().format("YYYY-MM-DD")}.xlsx`,
    });
    expect(axios.post).toHaveBeenCalledWith("https://example.com/response", {
      channels: "67890",
      thread_ts: "message-timestamp",
      text: "Here's the Excel file: https://example.com/file",
    });
  });
});
