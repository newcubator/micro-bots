import axios from "axios";
import dayjs from "dayjs";
import MockDate from "mockdate";
import { GitlabIssue } from "../gitlab/gitlab";
import { MocoEmployment, MocoUserType } from "../moco/types/moco-types";
import { calculateDueDate } from "./calculate-due-date";
import { createVacationHandoverIssues } from "./create-vacation-handover-issues";
import { getUsersWithStartAndEndDate } from "./get-users-with-start-and-end-date";

MockDate.set("2021-08-24");

global.console = { log: jest.fn() } as unknown as Console;

const exampleSchedulesResponse = {
  data: [
    {
      date: "2021-08-24",
      user: {
        id: 444555666,
        firstname: "Peter",
        lastname: "Silie",
      },
    },
  ],
  headers: { link: "" },
};

const exampleUserSchedulesResponse = {
  data: [
    {
      date: "2021-08-19",
    },
    {
      date: "2021-08-20",
    },
    {
      date: "2021-08-23",
    },
    {
      date: "2021-08-24",
    },
    {
      date: "2021-08-25",
    },
    {
      date: "2021-08-26",
    },
    {
      date: "2021-08-27",
    },
    {
      date: "2021-08-30",
    },
    {
      date: "2021-08-31",
    },
    {
      date: "2021-09-01",
    },
  ],
};

const exampleUserEmploymentResponse = {
  data: [
    {
      weekly_target_hours: 40.0,
      pattern: {
        am: [4.0, 4.0, 4.0, 4.0, 4.0],
        pm: [4.0, 4.0, 4.0, 4.0, 4.0],
      },
      from: "2020-04-01",
      to: null,
    },
  ],
};

const exampleTemplateResponse = {
  data: {
    name: "Urlaubsuebergabe",
    content: "This is some cool template",
  },
};

(axios.post as jest.Mock).mockImplementation(
  (): Promise<any> =>
    Promise.resolve({
      data: {
        web_url: "cool-url.com",
      },
    })
);

describe("vacation-handover", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a vacation handover", async () => {
    (axios.get as jest.Mock)
      .mockReturnValueOnce(exampleSchedulesResponse)
      .mockReturnValueOnce(exampleUserSchedulesResponse)
      .mockReturnValueOnce(exampleUserEmploymentResponse)
      .mockReturnValueOnce(exampleTemplateResponse);

    await createVacationHandoverIssues([]);

    expect(axios.get).nthCalledWith(1, "https://newcubator.mocoapp.com/api/v1/schedules", {
      headers: { Authorization: "Token token=not a real moco token" },
      params: { absence_code: 4, from: "2021-08-31", page: 1, to: "2021-08-31" },
    });
    expect(axios.get).nthCalledWith(2, "https://newcubator.mocoapp.com/api/v1/schedules", {
      headers: { Authorization: "Token token=not a real moco token" },
      params: { absence_code: 4, from: "2021-08-03", to: "2021-09-28", user_id: 444555666 },
    });
    expect(axios.get).nthCalledWith(3, "https://newcubator.mocoapp.com/api/v1/users/employments", {
      headers: { Authorization: "Token token=not a real moco token" },
      params: { from: "2021-08-03", to: "2021-09-28", user_id: 444555666 },
    });
    expect(axios.get).toHaveBeenCalledTimes(4);

    expect(axios.post).toHaveBeenCalledWith(
      "https://gitlab.com/api/v4/projects/11111111/issues",
      {
        description: "This is some cool template",
        due_date: "2021-08-18",
        labels: ["Urlaubsübergabe"],
        title: "Urlaubsübergabe Peter (19.08.2021 - 01.09.2021)",
      },
      { headers: { Authorization: "Bearer not a real gitlab token" } }
    );
  });

  it("should not create a vacation handover", async () => {
    (axios.get as jest.Mock)
      .mockReturnValueOnce(exampleSchedulesResponse)
      .mockReturnValueOnce({
        data: [
          {
            date: "2021-08-23",
          },
          {
            date: "2021-08-24",
          },
          {
            date: "2021-08-25",
          },
        ],
      })
      .mockReturnValueOnce(exampleUserEmploymentResponse)
      .mockReturnValueOnce(exampleTemplateResponse);

    await createVacationHandoverIssues([]);

    expect(axios.get).toHaveBeenCalledTimes(4);
    expect(axios.post).toHaveBeenCalledTimes(0);
  });

  it("should detect already created issue", async () => {
    (axios.get as jest.Mock)
      .mockReturnValueOnce(exampleSchedulesResponse)
      .mockReturnValueOnce(exampleUserSchedulesResponse)
      .mockReturnValueOnce(exampleUserEmploymentResponse)
      .mockReturnValueOnce(exampleTemplateResponse);

    await createVacationHandoverIssues([{ title: "Urlaubsübergabe Peter (19.08.2021 - 01.09.2021)" } as GitlabIssue]);

    expect(axios.get).toHaveBeenCalledTimes(4);
    expect(axios.post).toHaveBeenCalledTimes(0);
    expect(console.log as jest.Mock).toHaveBeenCalledWith(
      "Issue for detected vacation of Peter for vacation from 2021-08-19 to 2021-09-01 already exists"
    );
  });

  it("should detect already opened issue", async function () {
    (axios.get as jest.Mock)
      .mockReturnValueOnce(exampleSchedulesResponse)
      .mockReturnValueOnce(exampleUserSchedulesResponse)
      .mockReturnValueOnce(exampleUserEmploymentResponse)
      .mockReturnValueOnce(exampleTemplateResponse);

    await createVacationHandoverIssues([
      { title: "Urlaubsübergabe Peter (19.08.2021 - 01.09.2021)", state: "opened" } as GitlabIssue,
    ]);

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.post).toHaveBeenCalledTimes(0);
  });

  it("should calculate due date correctly", () => {
    const fullTimeEmployment = {
      pattern: {
        am: [4.0, 4.0, 4.0, 4.0, 4.0],
        pm: [4.0, 4.0, 4.0, 4.0, 4.0],
      },
    } as MocoEmployment;

    expect(calculateDueDate(dayjs("2021-10-15"), fullTimeEmployment)).toStrictEqual(dayjs("2021-10-14"));

    expect(calculateDueDate(dayjs("2021-10-16"), fullTimeEmployment)).toStrictEqual(dayjs("2021-10-15"));

    expect(calculateDueDate(dayjs("2021-10-17"), fullTimeEmployment)).toStrictEqual(dayjs("2021-10-15"));

    expect(
      calculateDueDate(dayjs("2021-10-17"), {
        pattern: {
          am: [4.0, 4.0, 4.0, 4.0, 0],
          pm: [4.0, 4.0, 4.0, 4.0, 0],
        },
      } as MocoEmployment)
    ).toStrictEqual(dayjs("2021-10-14"));

    expect(
      calculateDueDate(dayjs("2021-10-17"), {
        pattern: {
          am: [0, 0, 0, 0, 0],
          pm: [0, 0, 4.0, 0, 0],
        },
      } as MocoEmployment)
    ).toStrictEqual(dayjs("2021-10-13"));
  });

  it("should calculate start and end date", function () {
    expect(
      getUsersWithStartAndEndDate(
        [
          {
            user: {} as MocoUserType,
            vacationDates: [
              "2021-10-01",
              "2021-10-04",
              "2021-10-08",
              "2021-10-11",
              "2021-10-12",
              "2021-10-13",
              "2021-10-18",
              "2021-10-19",
            ],
            employment: exampleUserEmploymentResponse.data[0] as MocoEmployment,
          },
        ],
        dayjs("2021-10-11"),
        3
      )[0].dates
    ).toStrictEqual(["2021-10-08", "2021-10-13"]);

    expect(
      getUsersWithStartAndEndDate(
        [
          {
            user: {} as MocoUserType,
            vacationDates: [
              "2021-09-28",
              "2021-09-29",
              "2021-10-05",
              "2021-10-06",
              "2021-10-07",
              "2021-10-12",
              "2021-10-13",
              "2021-10-14",
              "2021-10-20",
              "2021-10-21",
            ],
            employment: {
              pattern: {
                am: [0, 4.0, 4.0, 4.0, 0],
                pm: [0, 4.0, 4.0, 4.0, 0],
              },
            } as MocoEmployment,
          },
        ],
        dayjs("2021-10-13"),
        3
      )[0].dates
    ).toStrictEqual(["2021-10-05", "2021-10-14"]);

    expect(
      getUsersWithStartAndEndDate(
        [
          {
            user: {} as MocoUserType,
            vacationDates: ["2021-10-05", "2021-10-06", "2021-10-07", "2021-10-20", "2021-10-21"],
            employment: {
              pattern: {
                am: [0, 4.0, 4.0, 4.0, 0],
                pm: [0, 4.0, 4.0, 4.0, 0],
              },
            } as MocoEmployment,
          },
        ],
        dayjs("2021-10-13"),
        3
      )
    ).toStrictEqual([]);

    expect(
      getUsersWithStartAndEndDate(
        [
          {
            user: {} as MocoUserType,
            vacationDates: [
              "2021-10-05",
              "2021-10-06",
              "2021-10-07",
              "2021-10-11",
              "2021-10-15",
              "2021-10-20",
              "2021-10-21",
            ],
            employment: {
              pattern: {
                am: [4.0, 0, 0, 0, 4.0],
                pm: [4.0, 0, 0, 0, 4.0],
              },
            } as MocoEmployment,
          },
        ],
        dayjs("2021-10-13"),
        3
      )[0].dates
    ).toStrictEqual(["2021-10-11", "2021-10-15"]);
  });
});