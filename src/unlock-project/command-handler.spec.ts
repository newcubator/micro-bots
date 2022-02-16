import { getProjects } from "../moco/projects";
import { commandHandler } from "./command-handler";

jest.mock("../moco/projects");
const getProjectsMock = getProjects as jest.Mock;

test("command handler", async () => {
  getProjectsMock.mockResolvedValueOnce([
    {
      id: "1",
      name: "Project One",
      deal: "b8232961-f16c-4a83-bcdd-c001250481d7",
      custom_properties: {
        Bestellnummer: "B2021-01",
      },
    },
    {
      id: "2",
      name: "Should not be filtered out because if missing deal",
      deal: null,
      custom_properties: {
        Bestellnummer: "B2021-02",
      },
    },
    {
      id: "3",
      name: "Should be filtered out because if missing order number",
      deal: "4df4949b-3072-4aa7-bc7c-a1c02a068521",
      custom_properties: {},
    },
    {
      id: "4",
      name: "Project Four",
      deal: "66d76559-58c9-4601-84bc-629e755e2798",
      custom_properties: {
        Bestellnummer: "B2021-04",
      },
    },
  ]);

  let result = await commandHandler({} as any);

  // don't load completed projects
  expect(getProjectsMock).toHaveBeenCalledWith({ include_archived: false });

  expect(result.statusCode).toBe(200);
  expect(result.body).toMatchSnapshot();
});

test("respond when loads no projects", async () => {
  getProjectsMock.mockResolvedValueOnce([]);

  let result = await commandHandler({} as any);

  expect(result.statusCode).toBe(200);
  expect(result.body).toMatchSnapshot();
});
