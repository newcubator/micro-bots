import axios from "axios";
import { getUsersWithVacation } from "../moco/vacation";
import { handler } from "./holiday-set-automatic-mail-replies";

jest.mock("../moco/vacation");

const mockGetUsersWithVacation = getUsersWithVacation as unknown as jest.Mock;
const axiosGetMock = axios.get as jest.Mock;

describe("HolidaySetAutomaticMailReplies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MICROSOFT_TOKEN = "1be0afda-f723-4ad4-bdc6-7603041ebe0e";
    process.env.MICROSOFT_CLIENT_ID = "5b846559-5861-42d4-92b0-787bef833831";
    process.env.MICROSOFT_CLIENT_SECRET = "JzB8Q~gcjTIBR8MR2lYDGfgd73slHsgidO6H.czI";
  });
  it("should set a mail reply for user", async () => {
    mockGetUsersWithVacation.mockResolvedValueOnce([
      {
        user: {
          email: "MaxMustermann@email.de",
        },
        dates: ["2022-11-08", "2022-11-10", "2022-11-14"],
        employment: null,
      },
    ]);
    axiosGetMock.mockResolvedValueOnce({
      access_token: "fake token",
    });
    axiosGetMock.mockResolvedValueOnce({
      values: [
        {
          mail: "MaxMustermann@email.de",
          id: "1234-5678-9012",
        },
      ],
    });
    axiosGetMock.mockResolvedValueOnce({});

    const result = await handler();

    expect(result).toBe(1);
  });
});
