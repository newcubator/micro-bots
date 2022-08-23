import { getRealSlackName } from "../slack/slack";
import { eventHandler } from "./event-handler";
import { getCompanyById } from "../moco/companies";
import { getContactById } from "../moco/contacts";
import { slackClient } from "../clients/slack";
import { renderShortMailPdf } from "./pdf";
import dayjs from "dayjs";
import axios from "axios";
import MockDate from "mockdate";

MockDate.set("2022-01-02");

jest.mock("../moco/companies");
jest.mock("../moco/contacts");
jest.mock("./pdf");
jest.mock("../slack/slack");

const getCompanieMock = getCompanyById as jest.Mock;
const getSlackNameMock = getRealSlackName as jest.Mock;
const getContactByIdMock = getContactById as jest.Mock;
const renderShortMailPdfMock = renderShortMailPdf as jest.Mock;
const conversationsJoinMock = slackClient.conversations.join as jest.Mock;
const fileUploadMock = slackClient.files.upload as jest.Mock;
const axiosPostMock = axios.post as jest.Mock;

test("handle event short mail generation dortmund to male with company adress", async () => {
  getContactByIdMock.mockResolvedValueOnce({
    id: 1,
    gender: "H",
    firstname: "Bill",
    lastname: "Gates",
    work_address: "\nFensterstraße 1\n12345 Fensterhausen ",
    company: {
      id: 42,
      type: "Firma",
      name: "Fenster",
    },
  });
  getCompanieMock.mockResolvedValueOnce({
    id: 42,
    name: "Guugel",
    address: "Suchallee 42\n54321 Suchstadt",
  });

  renderShortMailPdfMock.mockResolvedValueOnce(Buffer.from("pdf"));

  getSlackNameMock.mockResolvedValueOnce({
    ok: true,
    profile: {
      real_name: "Max Mustermann",
    },
  });

  await eventHandler({
    detail: {
      responseUrl: "https://slack.com/response_url",
      personId: "1",
      message: "Testnachricht an Bill",
      sender: "1337",
      messageTs: "1633540187.000600",
      channelId: "C02BBA8DWVD",
      location: "D",
    },
  } as any);

  expect(getCompanieMock).toHaveBeenCalledWith(42);
  expect(getSlackNameMock).toHaveBeenCalledWith("1337");
  expect(getContactByIdMock).toHaveBeenCalledWith("1");
  expect(renderShortMailPdfMock).toHaveBeenCalledWith({
    sender: "Max Mustermann",
    senderAddressHeader: "newcubator GmbH | Westenhellweg 85-89 | 44137 Dortmund",
    senderAddressFooter: "\nWestenhellweg 85-89\n44137 Dortmund\n+49 (0) 231 58687380\n",
    recipient: {
      salutation: "geehrter Herr",
      firstname: "Bill",
      lastname: "Gates",
      address: "Suchallee 42\n54321 Suchstadt",
    },
    date: dayjs(),
    text: "Testnachricht an Bill",
  });
  expect(conversationsJoinMock).toHaveBeenCalledWith({ channel: "C02BBA8DWVD" });
  expect(fileUploadMock).toHaveBeenCalledWith({
    file: expect.anything(),
    filename: "Kurzbrief Gates.pdf",
    initial_comment: "",
    channels: "C02BBA8DWVD",
    thread_ts: "1633540187.000600",
    broadcast: "true",
  });
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: expect.stringContaining("Bill Gates"),
  });
});

test("handle event short mail generation hannover to female without company adress", async () => {
  getContactByIdMock.mockResolvedValueOnce({
    id: 2,
    gender: "F",
    firstname: "Melinda",
    lastname: "Gates",
    work_address: "\nFensterstraße 1\n12345 Fensterhausen ",
    company: null,
  });
  getCompanieMock.mockResolvedValueOnce({});

  renderShortMailPdfMock.mockResolvedValueOnce(Buffer.from("pdf"));

  getSlackNameMock.mockResolvedValueOnce({
    ok: true,
    profile: {
      real_name: "Max Mustermann",
    },
  });

  await eventHandler({
    detail: {
      responseUrl: "https://slack.com/response_url",
      personId: "2",
      message: "Testnachricht an Melinda",
      sender: "1337",
      messageTs: "1633540187.000600",
      channelId: "C02BBA8DWVD",
      location: "H",
    },
  } as any);

  expect(getCompanieMock).toBeCalledTimes(1);
  expect(getSlackNameMock).toHaveBeenCalledWith("1337");
  expect(getContactByIdMock).toHaveBeenCalledWith("2");
  expect(renderShortMailPdfMock).toHaveBeenCalledWith({
    sender: "Max Mustermann",
    senderAddressHeader: "newcubator GmbH | Bödekerstraße 22 | 30161 Hannover",
    senderAddressFooter: "\nBödekerstraße 22\n30161 Hannover\n+49 (0) 511-95731300\n",
    recipient: {
      salutation: "geehrte Frau",
      firstname: "Melinda",
      lastname: "Gates",
      address: "\nFensterstraße 1\n12345 Fensterhausen ",
    },
    date: dayjs(),
    text: "Testnachricht an Melinda",
  });
  expect(conversationsJoinMock).toHaveBeenCalledWith({ channel: "C02BBA8DWVD" });
  expect(fileUploadMock).toHaveBeenCalledWith({
    file: expect.anything(),
    filename: "Kurzbrief Gates.pdf",
    initial_comment: "",
    channels: "C02BBA8DWVD",
    thread_ts: "1633540187.000600",
    broadcast: "true",
  });
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: expect.stringContaining("Melinda Gates"),
  });
});
