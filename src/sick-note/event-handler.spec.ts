import axios from "axios";
import dayjs from "dayjs";
import MockDate from "mockdate";
import { removeUserPresences } from "../moco/presences";
import { createMultipleUserSchedules } from "../moco/schedules";
import { findUserBySlackCommand, findUserBySlackIdentity, getUsers } from "../moco/users";
import { getSlackUserProfile } from "../slack/slack";
import { ActionType } from "../slack/types/slack-types";
import { eventHandler } from "./event-handler";

jest.mock("../moco/users");
jest.mock("../moco/presences");
jest.mock("../moco/schedules");
jest.mock("../slack/slack");

MockDate.set("2022-01-02");

const axiosPostMock = axios.post as jest.Mock;
const mocoScheduleMock = createMultipleUserSchedules as jest.Mock;
const getUsersMock = getUsers as unknown as jest.Mock;
const findUserBySlackCommandMock = findUserBySlackCommand as jest.Mock;
const findUserBySlackIdentityMock = findUserBySlackIdentity as jest.Mock;
const removeUserPresencesMock = removeUserPresences as jest.Mock;
const getSlackUserProfileMock = getSlackUserProfile as jest.Mock;

const exampleMocoUser = {
  id: 1,
  firstname: "Max",
  lastname: "Mustermann",
  email: "max.mustermann@test.de",
};

describe("SicknoteEventHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle sick note event with single day selection", async () => {
    getUsersMock.mockResolvedValueOnce([exampleMocoUser]);
    findUserBySlackCommandMock.mockReturnValueOnce(() => ({
      firstname: "Max",
      lastname: "Mustermann",
      id: "42",
      email: "max.mustermann@newcubator.com",
      custom_properties: {
        ["Job Bezeichnung"]: "Testsubject",
        Standort: "Hannover",
      },
    }));
    mocoScheduleMock.mockImplementationOnce(() => Promise.resolve());
    removeUserPresencesMock.mockReturnValueOnce(Promise.resolve());

    await eventHandler({
      channelId: "C02BBA8DWVD",
      responseUrl: "https://slack.com/response_url",
      actionType: ActionType.SICK_NOTE,
      forSingleDay: true,
      startDay: null,
      endDay: null,
      userId: "1337",
      userName: "Max",
    } as any);

    expect(getUsersMock).toHaveBeenCalledTimes(1);
    expect(findUserBySlackCommandMock).toHaveBeenCalledTimes(1);
    expect(findUserBySlackCommandMock).toHaveBeenCalledWith({ user_id: "1337", user_name: "Max" });
    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringMatching("Deine Krankmeldung wurde erfolgreich eingereicht! Gut Besserung!"),
    });
    expect(mocoScheduleMock).toHaveBeenCalledWith(
      dayjs("2022-01-02T00:00:00.000Z"),
      dayjs("2022-01-02T00:00:00.000Z"),
      "42",
      3,
      true,
      true,
      expect.stringMatching("Krankheit ohne AU"),
      null,
      true,
    );
    expect(removeUserPresencesMock).toHaveBeenCalledWith(
      "42",
      dayjs("2022-01-02T00:00:00.000Z"),
      dayjs("2022-01-02T00:00:00.000Z"),
    );
  });

  it("should handle sick note event with multiple days", async () => {
    getUsersMock.mockResolvedValueOnce([exampleMocoUser]);
    findUserBySlackCommandMock.mockReturnValueOnce(() => ({
      firstname: "Max",
      lastname: "Mustermann",
      id: "42",
      email: "max.mustermann@newcubator.com",
      custom_properties: {
        ["Job Bezeichnung"]: "Testsubject",
        Standort: "Hannover",
      },
    }));
    mocoScheduleMock.mockImplementationOnce(() => Promise.resolve());
    removeUserPresencesMock.mockReturnValueOnce(Promise.resolve());

    await eventHandler({
      channelId: "C02BBA8DWVD",
      responseUrl: "https://slack.com/response_url",
      actionType: ActionType.SICK_NOTE,
      forSingleDay: false,
      startDay: "2024-01-01",
      endDay: "2024-01-04",
      userId: "1337",
      userName: "Max",
    } as any);

    expect(getUsersMock).toHaveBeenCalledTimes(1);
    expect(findUserBySlackCommandMock).toHaveBeenCalledTimes(1);
    expect(findUserBySlackCommandMock).toHaveBeenCalledWith({ user_id: "1337", user_name: "Max" });
    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringMatching("Deine Krankmeldung wurde erfolgreich eingereicht! Gut Besserung!"),
    });
    expect(mocoScheduleMock).toHaveBeenCalledWith(
      dayjs("2024-01-01"),
      dayjs("2024-01-04"),
      "42",
      3,
      true,
      true,
      expect.stringMatching("Krankheit mit AU"),
      null,
      true,
    );
    expect(removeUserPresencesMock).toHaveBeenCalledWith("42", dayjs("2024-01-01"), dayjs("2024-01-04"));
  });

  it("should return an error message with invalid dates", async () => {
    getUsersMock.mockResolvedValueOnce([exampleMocoUser]);
    findUserBySlackCommandMock.mockReturnValueOnce(() => ({
      firstname: "Max",
      lastname: "Mustermann",
      id: "42",
      email: "max.mustermann@newcubator.com",
      custom_properties: {
        ["Job Bezeichnung"]: "Testsubject",
        Standort: "Hannover",
      },
    }));
    mocoScheduleMock.mockImplementationOnce(() => Promise.resolve());

    await eventHandler({
      channelId: "C02BBA8DWVD",
      responseUrl: "https://slack.com/response_url",
      actionType: ActionType.SICK_NOTE,
      forSingleDay: false,
      startDay: "2024-01-02",
      endDay: "2024-01-01",
      userId: "1337",
      userName: "Max",
    } as any);

    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: expect.stringMatching("Das Start-Datum darf nicht nach dem End-Datum liegen."),
    });
    expect(mocoScheduleMock).not.toHaveBeenCalled();
  });

  it("should use the slack profile email to find the moco user", async () => {
    getUsersMock.mockResolvedValueOnce([exampleMocoUser]);
    findUserBySlackCommandMock.mockReturnValueOnce(() => undefined);
    getSlackUserProfileMock.mockResolvedValueOnce({
      profile: {
        email: "max.mustermann@test.de",
        real_name: "Max Mustermann",
        display_name: "Max Mustermann",
      },
    });
    findUserBySlackIdentityMock.mockReturnValueOnce(exampleMocoUser);
    mocoScheduleMock.mockImplementationOnce(() => Promise.resolve());
    removeUserPresencesMock.mockReturnValueOnce(Promise.resolve());

    await eventHandler({
      channelId: "C02BBA8DWVD",
      responseUrl: "https://slack.com/response_url",
      actionType: ActionType.SICK_NOTE,
      forSingleDay: true,
      startDay: null,
      endDay: null,
      userId: "1337",
      userName: "other-slack-name",
    } as any);

    expect(getSlackUserProfileMock).toHaveBeenCalledWith("1337");
    expect(findUserBySlackIdentityMock).toHaveBeenCalledWith([exampleMocoUser], {
      user_id: "1337",
      user_name: "other-slack-name",
      user_email: "max.mustermann@test.de",
      real_name: "Max Mustermann",
      display_name: "Max Mustermann",
    });
    expect(mocoScheduleMock).toHaveBeenCalledWith(
      dayjs("2022-01-02T00:00:00.000Z"),
      dayjs("2022-01-02T00:00:00.000Z"),
      1,
      3,
      true,
      true,
      expect.stringMatching("Krankheit ohne AU"),
      null,
      true,
    );
  });

  it("should return a slack error message when no moco user can be found", async () => {
    getUsersMock.mockResolvedValueOnce([exampleMocoUser]);
    findUserBySlackCommandMock.mockReturnValueOnce(() => undefined);
    getSlackUserProfileMock.mockResolvedValueOnce({
      profile: {
        email: "unknown@test.de",
        real_name: "Unknown User",
        display_name: "Unknown",
      },
    });
    findUserBySlackIdentityMock.mockReturnValueOnce(undefined);

    await eventHandler({
      channelId: "C02BBA8DWVD",
      responseUrl: "https://slack.com/response_url",
      actionType: ActionType.SICK_NOTE,
      forSingleDay: true,
      startDay: null,
      endDay: null,
      userId: "1337",
      userName: "unknown",
    } as any);

    expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
      replace_original: "true",
      text: "Wir konnten deinen aktuellen Benutzer nicht in Moco finden. Prüfe deinen Benutzernamen und setze im Zweifel manuell deine SlackID in Moco",
    });
    expect(mocoScheduleMock).not.toHaveBeenCalled();
    expect(removeUserPresencesMock).not.toHaveBeenCalled();
  });
});
