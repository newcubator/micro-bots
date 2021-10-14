import axios from 'axios';
import MockDate from 'mockdate';
import { createVacationHandoverIssues } from './create-vacation-handover-issues';

MockDate.set("2021-08-24");

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
      due_date: "2021-08-19",
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
