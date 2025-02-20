import { eventHandler } from "./event-handler";
import { getProject } from "../moco/projects";
import { getContactById } from "../moco/contacts";
import { slackClient } from "../clients/slack";
import { renderCompletionNoticePdf } from "./pdf";
import dayjs from "dayjs";
import axios from "axios";
import MockDate from "mockdate";
import { uploadFileToSlackChannel } from "../slack/upload-file-to-slack-channel";

MockDate.set("2022-01-02");

jest.mock("../moco/projects");
jest.mock("../moco/deals");
jest.mock("../moco/contacts");
jest.mock("../slack/upload-file-to-slack-channel");
jest.mock("./pdf");

const getProjectMock = getProject as jest.Mock;
const getContactByIdMock = getContactById as jest.Mock;
const renderCompletionNoticePdfMock = renderCompletionNoticePdf as jest.Mock;
const conversationsJoinMock = slackClient.conversations.join as jest.Mock;
const uploadFileToSlackChannelMock = uploadFileToSlackChannel as jest.Mock;
const axiosPostMock = axios.post as jest.Mock;

test("handle event", async () => {
  getProjectMock.mockResolvedValueOnce({
    id: "project-01",
    name: "Mars Cultivation Season Manager",
    billing_address: "\n1 Rocket Road\nHawthorne, CA 90250\nUnited States\n",
    custom_properties: {
      Bestellnummer: "B01",
    },
    contact: {
      id: "person-01",
    },
  });
  uploadFileToSlackChannelMock.mockResolvedValueOnce({ ok: true });
  getContactByIdMock.mockResolvedValueOnce({
    firstname: "Elon",
    lastname: "Musk",
    gender: "M",
  });
  renderCompletionNoticePdfMock.mockResolvedValueOnce(Buffer.from("pdf"));

  await eventHandler({
    detail: {
      responseUrl: "https://slack.com/response_url",
      projectId: "project-01",
      projectName: "Mars Cultivation Season Manager",
      messageTs: "1633540187.000600",
      channelId: "C02BBA8DWVD",
    },
  } as any);

  expect(getProjectMock).toHaveBeenCalledWith("project-01");
  expect(getContactByIdMock).toHaveBeenCalledWith("person-01");
  expect(renderCompletionNoticePdfMock).toHaveBeenCalledWith({
    project: {
      name: "Mars Cultivation Season Manager",
      orderNumber: "B01",
    },
    recipient: {
      salutation: "geehrter Herr",
      firstname: "Elon",
      lastname: "Musk",
      address: "\n1 Rocket Road\nHawthorne, CA 90250\nUnited States\n",
    },
    date: dayjs(),
  });
  expect(conversationsJoinMock).toHaveBeenCalledWith({ channel: "C02BBA8DWVD" });
  expect(uploadFileToSlackChannelMock).toHaveBeenCalledWith({
    file: expect.anything(),
    filename: "Fertigstellungsanzeige_B01.pdf",
    initial_comment: "",
    channels: "C02BBA8DWVD",
    thread_ts: "1633540187.000600",
  });
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: expect.stringContaining("Mars Cultivation Season Manager"),
  });
});
