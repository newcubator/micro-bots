import axios from "axios";
import { slackChatPostEphemeral } from "../../slack/slack";
import { uploadHandler } from "./letterxpress-upload";
import { convertPdfToBase64, getMd5Hash } from "./pdf-converter";

jest.mock("./pdf-converter");
jest.mock("../../slack/slack");

const axiosPostMock = axios.post as jest.Mock;
const axiosGetMock = axios.get as jest.Mock;
const convertPdfToBase64Mock = convertPdfToBase64 as jest.Mock;
const getMD5HashMock = getMd5Hash as jest.Mock;
const slackPostEphemeralMock = slackChatPostEphemeral as jest.Mock;

const sampleBase64 = "sampleBase64String";
const correctMD5Hash = "b3eb6b11374e509bb6e8dc233480a82a";

test("upload pdf to letterxpress", async () => {
  axiosGetMock.mockResolvedValueOnce({});
  axiosPostMock.mockResolvedValueOnce({ data: { message: "OK" } });
  convertPdfToBase64Mock.mockResolvedValueOnce(sampleBase64);
  getMD5HashMock.mockResolvedValueOnce(correctMD5Hash);
  await uploadHandler({
    detail: {
      file: "sampleSlackDownloadLink",
      responseUrl: "sampleSlackResponseUrl",
      channelId: "1",
      sender: "Absender",
    },
  } as any);
  expect(getMD5HashMock).toHaveBeenCalledWith(sampleBase64);
  expect(axiosPostMock).toHaveBeenCalledWith("https://api.letterxpress.de/v1/setJob", {
    auth: {
      username: undefined,
      apikey: undefined,
    },
    letter: {
      base64_file: sampleBase64,
      base64_checksum: correctMD5Hash,
      specification: {
        color: "4",
        mode: "simplex",
        ship: "national",
        c4: "n",
      },
    },
  });
  expect(slackPostEphemeralMock).toHaveBeenCalledWith("1", "Der Brief ist jetzt unterwegs!", "Absender");
});
