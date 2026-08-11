import axios from "axios";
import dayjs from "dayjs";
import MockDate from "mockdate";
import {
  getSlackUsers,
  slackChatPostMessage,
  slackConversationsHistory,
  slackConversationsReplies,
} from "../slack/slack";
import { MocoEmployment, MocoUserType } from "../moco/types/moco-types";
import { calculateDueDate } from "./calculate-due-date";
import { VACATION_HANDOVER_CHECKLIST_BLOCK } from "./checklist";
import { createVacationHandoverMessages } from "./create-vacation-handover-messages";
import { getUsersWithStartAndEndDate } from "./get-users-with-start-and-end-date";

jest.mock("../slack/slack");

MockDate.set("2021-08-24");

const slackChatPostMessageMock = slackChatPostMessage as jest.Mock;
const slackConversationsHistoryMock = slackConversationsHistory as jest.Mock;
const slackConversationsRepliesMock = slackConversationsReplies as jest.Mock;
const getSlackUsersMock = getSlackUsers as jest.Mock;

const exampleUser = {
  id: "444555666",
  firstname: "Peter",
  lastname: "Silie",
  email: "peter.silie@newcubator.com",
  custom_properties: {},
} as MocoUserType;

const exampleSchedulesResponse = {
  data: [
    {
      date: "2021-08-24",
      user: exampleUser,
      assignment: { name: "Urlaub" },
    },
  ],
  headers: { link: "" },
};

const exampleUserSchedulesResponse = {
  data: [
    { date: "2021-08-19", assignment: { name: "Urlaub" } },
    { date: "2021-08-20", assignment: { name: "Urlaub" } },
    { date: "2021-08-23", assignment: { name: "Urlaub" } },
    { date: "2021-08-24", assignment: { name: "Urlaub" } },
    { date: "2021-08-25", assignment: { name: "Urlaub" } },
    { date: "2021-08-26", assignment: { name: "Feiertag" } },
    { date: "2021-08-27", assignment: { name: "Urlaub" } },
    { date: "2021-08-30", assignment: { name: "Urlaub" } },
    { date: "2021-08-31", assignment: { name: "Urlaub" } },
    { date: "2021-09-01", assignment: { name: "Urlaub" } },
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

describe("vacation-handover", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    slackConversationsHistoryMock.mockResolvedValue([]);
    slackConversationsRepliesMock.mockResolvedValue([]);
    getSlackUsersMock.mockResolvedValue({ members: [] });
    slackChatPostMessageMock
      .mockResolvedValueOnce({ ts: "1633540187.000600" })
      .mockResolvedValueOnce({ ts: "1633540187.000601" });
  });

  it("creates a Slack main message and a checklist thread", async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce(exampleSchedulesResponse)
      .mockResolvedValueOnce(exampleUserSchedulesResponse)
      .mockResolvedValueOnce(exampleUserEmploymentResponse);

    await createVacationHandoverMessages("C0123456789");

    expect(slackConversationsHistoryMock).toHaveBeenCalledWith("C0123456789");
    expect(slackChatPostMessageMock).toHaveBeenCalledTimes(2);
    expect(slackChatPostMessageMock.mock.calls[0][0]).toContain(
      "Urlaubsübergabe Peter Silie (19.08.2021 – 01.09.2021)",
    );
    expect(slackChatPostMessageMock.mock.calls[1][4]).toMatchObject({
      threadTs: "1633540187.000600",
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("mentions the vacation user by the Slack ID stored in Moco", async () => {
    const userWithSlackId = {
      ...exampleUser,
      custom_properties: { SlackId: " U1234567890 " },
    };
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({
        ...exampleSchedulesResponse,
        data: [{ ...exampleSchedulesResponse.data[0], user: userWithSlackId }],
      })
      .mockResolvedValueOnce(exampleUserSchedulesResponse)
      .mockResolvedValueOnce(exampleUserEmploymentResponse);

    await createVacationHandoverMessages("C0123456789");

    expect(getSlackUsersMock).not.toHaveBeenCalled();
    expect(slackChatPostMessageMock.mock.calls[0][4].blocks[1].text.text).toContain("<@U1234567890>");
  });

  it("mentions the vacation user by matching the Moco email to a Slack profile email", async () => {
    getSlackUsersMock.mockResolvedValueOnce({
      members: [
        {
          id: "U0987654321",
          profile: { email: " PETER.SILIE@newcubator.com " },
        },
      ],
    });
    (axios.get as jest.Mock)
      .mockResolvedValueOnce(exampleSchedulesResponse)
      .mockResolvedValueOnce(exampleUserSchedulesResponse)
      .mockResolvedValueOnce(exampleUserEmploymentResponse);

    await createVacationHandoverMessages("C0123456789");

    expect(getSlackUsersMock).toHaveBeenCalledTimes(1);
    expect(slackChatPostMessageMock.mock.calls[0][4].blocks[1].text.text).toContain("<@U0987654321>");
  });

  it("does not create a duplicate for an existing handover with a checklist thread", async () => {
    slackConversationsHistoryMock.mockResolvedValueOnce([
      {
        ts: "1633540187.000600",
        text: "Urlaubsübergabe-ID:444555666:2021-08-19:2021-09-01 Urlaubsübergabe Peter",
      },
    ]);
    slackConversationsRepliesMock.mockResolvedValueOnce([
      {
        ts: "1633540187.000601",
        blocks: [{ block_id: VACATION_HANDOVER_CHECKLIST_BLOCK }],
      },
    ]);
    (axios.get as jest.Mock)
      .mockResolvedValueOnce(exampleSchedulesResponse)
      .mockResolvedValueOnce(exampleUserSchedulesResponse)
      .mockResolvedValueOnce(exampleUserEmploymentResponse);

    await createVacationHandoverMessages("C0123456789");

    expect(slackChatPostMessageMock).not.toHaveBeenCalled();
  });

  it("creates only the checklist thread when an existing handover has no checklist yet", async () => {
    slackConversationsHistoryMock.mockResolvedValueOnce([
      {
        ts: "1633540187.000600",
        text: "Urlaubsübergabe-ID:444555666:2021-08-19:2021-09-01 Urlaubsübergabe Peter",
      },
    ]);
    slackConversationsRepliesMock.mockResolvedValueOnce([
      {
        ts: "1633540187.000600",
        text: "Urlaubsübergabe-ID:444555666:2021-08-19:2021-09-01 Urlaubsübergabe Peter",
      },
    ]);
    (axios.get as jest.Mock)
      .mockResolvedValueOnce(exampleSchedulesResponse)
      .mockResolvedValueOnce(exampleUserSchedulesResponse)
      .mockResolvedValueOnce(exampleUserEmploymentResponse);

    await createVacationHandoverMessages("C0123456789");

    expect(slackConversationsRepliesMock).toHaveBeenCalledWith("C0123456789", "1633540187.000600");
    expect(slackChatPostMessageMock).toHaveBeenCalledTimes(1);
    expect(slackChatPostMessageMock.mock.calls[0][4]).toMatchObject({
      threadTs: "1633540187.000600",
    });
  });

  it("creates a handover when the same person has an existing handover for another period", async () => {
    slackConversationsHistoryMock.mockResolvedValueOnce([
      {
        ts: "1633540187.000600",
        text: "Urlaubsübergabe-ID:444555666:2021-08-16:2021-08-18 Urlaubsübergabe Peter",
      },
    ]);
    (axios.get as jest.Mock)
      .mockResolvedValueOnce(exampleSchedulesResponse)
      .mockResolvedValueOnce(exampleUserSchedulesResponse)
      .mockResolvedValueOnce(exampleUserEmploymentResponse);

    await createVacationHandoverMessages("C0123456789");

    expect(slackChatPostMessageMock).toHaveBeenCalledTimes(2);
  });

  it("creates a handover when another person has an existing handover for the same period", async () => {
    slackConversationsHistoryMock.mockResolvedValueOnce([
      {
        ts: "1633540187.000600",
        text: "Urlaubsübergabe-ID:111222333:2021-08-19:2021-09-01 Urlaubsübergabe Maria",
      },
    ]);
    (axios.get as jest.Mock)
      .mockResolvedValueOnce(exampleSchedulesResponse)
      .mockResolvedValueOnce(exampleUserSchedulesResponse)
      .mockResolvedValueOnce(exampleUserEmploymentResponse);

    await createVacationHandoverMessages("C0123456789");

    expect(slackChatPostMessageMock).toHaveBeenCalledTimes(2);
  });

  it("does not create a handover for a vacation shorter than three days", async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce(exampleSchedulesResponse)
      .mockResolvedValueOnce({
        data: [
          { date: "2021-08-23", assignment: { name: "Urlaub" } },
          { date: "2021-08-24", assignment: { name: "Feiertag" } },
          { date: "2021-08-25", assignment: { name: "Urlaub" } },
        ],
      })
      .mockResolvedValueOnce(exampleUserEmploymentResponse);

    await createVacationHandoverMessages("C0123456789");

    expect(slackChatPostMessageMock).not.toHaveBeenCalled();
  });

  it("calculates the previous business day correctly", () => {
    const fullTimeEmployment = {
      pattern: {
        am: [4.0, 4.0, 4.0, 4.0, 4.0],
        pm: [4.0, 4.0, 4.0, 4.0, 4.0],
      },
    } as MocoEmployment;

    expect(calculateDueDate(dayjs("2021-10-15"), fullTimeEmployment)).toStrictEqual(dayjs("2021-10-14"));
    expect(calculateDueDate(dayjs("2021-10-17"), fullTimeEmployment)).toStrictEqual(dayjs("2021-10-15"));
  });

  it("detects the start and end of a vacation period", () => {
    expect(
      getUsersWithStartAndEndDate(
        [
          {
            user: {} as MocoUserType,
            vacationDates: ["2021-10-01", "2021-10-04", "2021-10-08", "2021-10-11", "2021-10-12", "2021-10-13"],
            employment: {
              pattern: { am: [4, 4, 4, 4, 4], pm: [4, 4, 4, 4, 4] },
            } as MocoEmployment,
          },
        ],
        dayjs("2021-10-11"),
        3,
      )[0].dates,
    ).toStrictEqual(["2021-10-08", "2021-10-13"]);
  });
});
