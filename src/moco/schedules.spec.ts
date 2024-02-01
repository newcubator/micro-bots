import axios from "axios";
import dayjs from "dayjs";
import { createMultipleUserSchedules } from "./schedules";

const axiosPostMock = axios.post as jest.Mock;

describe("create user schedules", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create multiple user schedules", async () => {
    axiosPostMock.mockResolvedValueOnce({});
    await createMultipleUserSchedules(
      dayjs("2021-01-01T00:00:00.000Z"),
      dayjs("2021-01-03T00:00:00.000Z"),
      "1",
      1,
      true,
      true,
      "comment",
      1,
      true,
    );
    expect(axiosPostMock).toHaveBeenCalledTimes(3);
    expect(axiosPostMock).toHaveBeenNthCalledWith(
      1,
      "https://newcubator.mocoapp.com/api/v1/schedules",
      {
        date: "2021-01-01",
        absence_code: 1,
        user_id: "1",
        am: true,
        pm: true,
        comment: "comment",
        symbol: 1,
        overwrite: true,
      },
      {
        headers: {
          Authorization: "Token token=not a real moco token",
        },
      },
    );
    expect(axiosPostMock).toHaveBeenNthCalledWith(
      2,
      "https://newcubator.mocoapp.com/api/v1/schedules",
      {
        date: "2021-01-02",
        absence_code: 1,
        user_id: "1",
        am: true,
        pm: true,
        comment: "comment",
        symbol: 1,
        overwrite: true,
      },
      {
        headers: {
          Authorization: "Token token=not a real moco token",
        },
      },
    );
    expect(axiosPostMock).toHaveBeenNthCalledWith(
      3,
      "https://newcubator.mocoapp.com/api/v1/schedules",
      {
        date: "2021-01-03",
        absence_code: 1,
        user_id: "1",
        am: true,
        pm: true,
        comment: "comment",
        symbol: 1,
        overwrite: true,
      },
      {
        headers: {
          Authorization: "Token token=not a real moco token",
        },
      },
    );
  });
});
