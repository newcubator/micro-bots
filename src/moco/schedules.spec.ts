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
    await createMultipleUserSchedules(dayjs("2021-01-01"), dayjs("2021-01-10"), "1", 1, true, true, "comment", 1, true);
    expect(axiosPostMock).toHaveBeenCalledTimes(10);
  });
});
