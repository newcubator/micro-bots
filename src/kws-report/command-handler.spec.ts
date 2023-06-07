import { getProjects } from "../moco/projects";
import { ActionType } from "../slack/types/slack-types";
import { commandHandler } from "./command-handler";

// Mock the getProjects function
jest.mock("../moco/projects", () => ({
  getProjects: jest.fn(),
}));

describe("commandHandler", () => {
  it("returns no projects response when no projects are returned from Moco", async () => {
    (getProjects as jest.Mock).mockResolvedValue([]);

    const result = await commandHandler();

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        response_type: "in_channel",
        text: "Konnte keine Projekte finden.",
      }),
    });
  });

  it("returns projects response when projects are returned from Moco", async () => {
    (getProjects as jest.Mock).mockResolvedValue([
      {
        id: 1,
        name: "kws Project",
        customer: { name: "kws" },
      },
      {
        id: 2,
        name: "Other Project",
        customer: { name: "other" },
      },
    ]);

    const result = await commandHandler();

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        text: "Lock project angefragt",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Wähle ein KWS Projekt für den Export aus.",
            },
            accessory: {
              type: "static_select",
              action_id: ActionType.KWS_EXCEL_EXPORT,
              placeholder: {
                type: "plain_text",
                text: "Projekt auswählen...",
                emoji: true,
              },
              options: [
                {
                  value: "1",
                  text: {
                    type: "plain_text",
                    text: "kws Project",
                    emoji: true,
                  },
                },
              ],
            },
          },
        ],
      }),
    });
  });
});
