import { eventHandler } from "./event-handler";
import { getProject } from "../moco/projects";
import { getDealById } from "../moco/deals";
import { getContactById } from "../moco/contacts";
import { slackClient } from "../clients/slack";
import { renderCompletionNoticePdf } from "./pdf";
import dayjs from "dayjs";
import axios from "axios";
import MockDate from "mockdate";

MockDate.set("2022-01-02");

jest.mock("../moco/projects");
jest.mock("../moco/deals");
jest.mock("../moco/contacts");
jest.mock("./pdf");
const getProjectMock = getProject as jest.Mock;
const getDealByIdMock = getDealById as jest.Mock;
const getContactByIdMock = getContactById as jest.Mock;
const renderCompletionNoticePdfMock = renderCompletionNoticePdf as jest.Mock;
const fileUploadMock = slackClient.files.upload as jest.Mock;
const axiosPostMock = axios.post as jest.Mock;

test("handle event", async () => {
  getProjectMock.mockResolvedValueOnce({
    id: "project-01",
    name: "Mars Cultivation Season Manager",
    billing_address: "\n1 Rocket Road\nHawthorne, CA 90250\nUnited States\n",
    deal: {
      id: "deal-01",
    },
    custom_properties: {
      Bestellnummer: "B01",
    },
  });
  getDealByIdMock.mockResolvedValueOnce({
    person: {
      id: "person-01",
    },
  });
  getContactByIdMock.mockResolvedValueOnce({
    firstname: "Elon",
    lastname: "Musk",
    gender: "M",
  });
  renderCompletionNoticePdfMock.mockResolvedValueOnce(Buffer.from("pdf"));
  fileUploadMock.mockResolvedValue({ ok: true });
  axiosPostMock.mockResolvedValue({});

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
  expect(getDealByIdMock).toHaveBeenCalledWith("deal-01");
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
  expect(fileUploadMock).toHaveBeenCalled();
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: expect.stringContaining("Mars Cultivation Season Manager"),
  });
});
