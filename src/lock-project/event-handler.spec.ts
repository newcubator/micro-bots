import { eventHandler } from "./event-handler";
import { getProject, putProjectContract } from "../moco/projects";
import axios from "axios";
import MockDate from "mockdate";

MockDate.set("2022-01-02");

jest.mock("../moco/projects");
jest.mock("../moco/deals");
jest.mock("../moco/contacts");
const getProjectMock = getProject as jest.Mock;
const putProjectContractMock = putProjectContract as jest.Mock;
const axiosPostMock = axios.post as jest.Mock;

test("handle event", async () => {
  getProjectMock.mockResolvedValueOnce({
    id: "project-01",
    name: "Mars Cultivation Season Manager",
    billing_address: "\n1 Rocket Road\nHawthorne, CA 90250\nUnited States\n",
    contracts: [
      {
        firstname: "Elon",
        lastname: "Musk",
        active: true,
      },
      {
        firstname: "Bill",
        lastname: "Gates",
        active: true,
      },
      {
        firstname: "Jeff",
        lastname: "Bezos",
        active: true,
      },
    ],
  });

  await eventHandler({
    detail: {
      responseUrl: "https://slack.com/response_url",
      projectId: "project-01",
      projectName: "Mars Cultivation Season Manager",
      messageTs: "1633540187.000600",
      channelId: "C02BBA8DWVD",
    },
  } as any);

  expect(getProjectMock).toHaveBeenCalledWith("project-01");
  expect(putProjectContractMock.mock.calls).toEqual([
    ["project-01", { active: false, firstname: "Elon", lastname: "Musk" }],
    ["project-01", { active: false, firstname: "Bill", lastname: "Gates" }],
    ["project-01", { active: false, firstname: "Jeff", lastname: "Bezos" }],
  ]);
  expect(axiosPostMock).toHaveBeenCalledWith("https://slack.com/response_url", {
    replace_original: "true",
    text: expect.stringContaining("Mars Cultivation Season Manager"),
  });
});
