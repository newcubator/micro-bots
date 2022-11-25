import axios from "axios";
import { getMessage, getMessageAttachments, markMessageAsRead, moveMessage } from "./mail";
import { SAMPLE_ATTACHMENTS, SAMPLE_MESSAGE } from "./mail.sample";
import { getAzureAccessToken } from "./token";

jest.mock("./token");

const getAzureAccessTokenMock = getAzureAccessToken as jest.Mock;
const axiosGetMock = axios.get as jest.Mock;
const axiosPostMock = axios.post as jest.Mock;
const axiosPatchMock = axios.patch as jest.Mock;

getAzureAccessTokenMock.mockResolvedValue("mocked-access-token");

afterEach(() => {
  jest.clearAllMocks();
});

describe("getMessage", () => {
  it("should get message", async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: SAMPLE_MESSAGE,
    });

    await expect(getMessage("test@jestjs.io", "abc123")).resolves.toMatchObject(SAMPLE_MESSAGE);

    expect(axiosGetMock).toHaveBeenCalledWith("https://graph.microsoft.com/v1.0/users/test@jestjs.io/messages/abc123", {
      headers: {
        Authorization: "Bearer mocked-access-token",
        Prefer: 'IdType="ImmutableId",outlook.body-content-type="text"',
      },
    });
  });

  it("throw exception when loading message attachments fails", async () => {
    axiosGetMock.mockRejectedValueOnce(new Error("some error"));

    await expect(getMessage("test@jestjs.io", "abc123")).rejects.toThrowError(/some error/);
  });
});

describe("getMessageAttachments", () => {
  it("should get message attachments", async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        value: SAMPLE_ATTACHMENTS,
      },
    });

    await expect(getMessageAttachments("test@jestjs.io", "abc123")).resolves.toMatchObject(SAMPLE_ATTACHMENTS);

    expect(axiosGetMock).toHaveBeenCalledWith(
      "https://graph.microsoft.com/v1.0/users/test@jestjs.io/messages/abc123/attachments",
      {
        headers: {
          Authorization: "Bearer mocked-access-token",
        },
      }
    );
  });

  it("throw exception when loading message attachments fails", async () => {
    axiosGetMock.mockRejectedValueOnce(new Error("some error"));

    await expect(getMessageAttachments("test@jestjs.io", "abc123")).rejects.toThrowError(/some error/);
  });
});

describe("markMessageAsRead", () => {
  it("should mark message as read", async () => {
    await expect(markMessageAsRead("test@jestjs.io", "abc123")).resolves;

    expect(axiosPatchMock).toHaveBeenCalledWith(
      "https://graph.microsoft.com/v1.0/users/test@jestjs.io/messages/abc123",
      { isRead: true },
      {
        headers: {
          Authorization: "Bearer mocked-access-token",
        },
      }
    );
  });

  it("throw exception when marking message as read fails", async () => {
    axiosPatchMock.mockRejectedValueOnce(new Error("some error"));

    await expect(markMessageAsRead("test@jestjs.io", "abc123")).rejects.toThrowError(/some error/);
  });
});

describe("moveMessage", () => {
  it("should move message", async () => {
    await expect(moveMessage("test@jestjs.io", "abc123", "def456")).resolves;

    expect(axiosPostMock).toHaveBeenCalledWith(
      "https://graph.microsoft.com/v1.0/users/test@jestjs.io/messages/abc123/move",
      { destinationId: "def456" },
      {
        headers: {
          Authorization: "Bearer mocked-access-token",
        },
      }
    );
  });

  it("throw exception when moving message fails", async () => {
    axiosPostMock.mockRejectedValueOnce(new Error("some error"));

    await expect(moveMessage("test@jestjs.io", "abc123", "def456")).rejects.toThrowError(/some error/);
  });
});
