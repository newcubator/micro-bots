import { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import { SAMPLE_ATTACHMENTS, SAMPLE_MESSAGE } from "../_shared/microsoft/mail.sample";
import { handler } from "./incoming-mail";
import { getMessageAttachments, getMessage, markMessageAsRead, moveMessage } from "../_shared/microsoft/mail";
import { getIssueTemplateByName } from "../gitlab/templates";
import { createIssue, updateIssueDescription, uploadFile } from "../gitlab/issues";

jest.mock("../_shared/microsoft/mail");
jest.mock("../gitlab/templates");
jest.mock("../gitlab/issues");

const getMessageMock = getMessage as unknown as jest.Mock;
const getIssueTemplateMock = getIssueTemplateByName as jest.Mock;
const getAttachmentsMock = getMessageAttachments as jest.Mock;
const uploadFileMock = uploadFile as jest.Mock;
const createIssueMock = createIssue as jest.Mock;
const updateIssueDescriptionMock = updateIssueDescription as jest.Mock;
const markMessageAsReadMock = markMessageAsRead as jest.Mock;
const moveMessageMock = moveMessage as jest.Mock;

describe("Recruitment Incoming Job Application Mail", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create gitlab issue from mail job application", async () => {
    getMessageMock.mockResolvedValueOnce(SAMPLE_MESSAGE);
    getIssueTemplateMock.mockResolvedValueOnce(SAMPLE_TEMPLATE);
    getAttachmentsMock.mockResolvedValueOnce(SAMPLE_ATTACHMENTS);
    uploadFileMock.mockResolvedValueOnce({
      markdown: "![ori3.jpg](https://gitlab.com/ori3.jpg)",
    });
    uploadFileMock.mockResolvedValueOnce({
      markdown: "![Lebenslauf.pdf](https://gitlab.com/Lebenslauf.pdf)",
    });
    createIssueMock.mockResolvedValue({
      id: 13,
      iid: 6,
    });
    markMessageAsReadMock.mockResolvedValueOnce({});

    await expect(handler(SAMPLE_EVENT)).resolves.toMatchObject({
      statusCode: 200,
      body: '{"result":"Done"}',
    });

    expect(createIssueMock.mock.calls[0]).toMatchSnapshot();
    expect(updateIssueDescriptionMock.mock.calls[0]).toMatchSnapshot();
    expect(markMessageAsReadMock).toHaveBeenCalledWith(
      "info@newcubator.com",
      "AQMkADQ3YTAyOWE2LTdjNjAtNDhjMy1iNWY4LTY0Y2RjODI0MmE0MABGAAAVc"
    );
    expect(moveMessageMock).toHaveBeenCalledWith(
      "info@newcubator.com",
      "AQMkADQ3YTAyOWE2LTdjNjAtNDhjMy1iNWY4LTY0Y2RjODI0MmE0MABGAAAVc",
      "AAMkAGJmODcwNWExLWM3ZmItNGNlZS04N2Q2LTc4YTJkMTZkOGJmOQAuAAAAAACsW_joJTKFSIXU5SXQHv11AQA4LQp9ObtJT7LiE4tqoOmkAAOkGk5ZAAA="
    );
  });

  it("should return error when mail messageId is missing", async () => {
    const event = {
      queryStringParameters: {
        id: undefined,
      },
    } as any as APIGatewayRequestAuthorizerEventV2;

    await expect(handler(event)).resolves.toMatchObject({
      statusCode: 400,
      body: "Missing 'messageId'",
    });

    expect(getMessageMock).toBeCalledTimes(0);
  });
});

const SAMPLE_EVENT = {
  queryStringParameters: {
    id: "AQMkADQ3YTAyOWE2LTdjNjAtNDhjMy1iNWY4LTY0Y2RjODI0MmE0MABGAAAVc",
  },
} as any as APIGatewayRequestAuthorizerEventV2;

const SAMPLE_TEMPLATE = {
  content: `Template Content
[NAME]
[EMAIL]
[BODY]
[WEBLINK]`,
};
