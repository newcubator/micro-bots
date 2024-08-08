import axios from "axios";
import { getAzureAccessToken } from "./token";

const axiosPostMock = axios.post as jest.Mock;

describe("getAzureAccessToken", () => {
  beforeEach(() => {
    process.env.MICROSOFT_TOKEN = "mocked-microsoft-token";
    process.env.MICROSOFT_CLIENT_ID = "mocked-microsoft-client-id";
    process.env.MICROSOFT_CLIENT_SECRET = "mocked-microsoft-client-secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("throw exception when getting access token fails", async () => {
    axiosPostMock.mockRejectedValueOnce(new Error("some error"));

    await expect(getAzureAccessToken()).rejects.toThrow(/some error/);
  });

  it("should get access token", async () => {
    axiosPostMock.mockResolvedValueOnce({
      data: {
        access_token: "mocked-access-token",
        expires_in: 3600,
      },
    });

    await expect(getAzureAccessToken()).resolves.toBe("mocked-access-token");

    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      "https://login.microsoftonline.com/mocked-microsoft-token/oauth2/v2.0/token",
      "client_id=mocked-microsoft-client-id&client_secret=mocked-microsoft-client-secret&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    await expect(getAzureAccessToken()).resolves.toBe("mocked-access-token");

    expect(axiosPostMock).toHaveBeenCalledTimes(1);
  });

  it("throw exception when microsoft token is not configured", async () => {
    delete process.env.MICROSOFT_TOKEN;

    await expect(getAzureAccessToken()).rejects.toThrow(/api token/);
  });

  it("throw exception when microsoft client id is not configured", async () => {
    delete process.env.MICROSOFT_CLIENT_ID;

    await expect(getAzureAccessToken()).rejects.toThrow(/client id/);
  });

  it("throw exception when microsoft client secret is not configured", async () => {
    delete process.env.MICROSOFT_CLIENT_SECRET;

    await expect(getAzureAccessToken()).rejects.toThrow(/client secret/);
  });
});
