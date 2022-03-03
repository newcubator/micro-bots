import { APIGatewayEvent } from "aws-lambda";
import { getProjects } from "../moco/projects";
import { ActionType } from "../slack/types/slack-types";

export const commandHandler = async (event: APIGatewayEvent) => {
  // no need to parse the command input

  const projects = await getProjects({ include_archived: false });
  const options = projects
    .filter((project) => project.deal)
    .slice(0, 100) // slack allows 100 options max
    .map((project) => {
      return {
        value: project.id.toString(),
        text: {
          type: "plain_text",
          text: project.name,
          emoji: true,
        },
      };
    });
  console.log(`Loaded ${options.length} projects to select from`);

  if (!options.length) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        response_type: "in_channel",
        text: "Konnte keine projekte finden.",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      response_type: "in_channel",
      text: "Fertigstellungsanzeige angefragt",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Ich erstelle dir gerne eine Fertigstellungsanzeige. Wähle dazu bitte rechts das gewünschte Projekt aus und ich mache mich sofort an die Arbeit.",
          },
          accessory: {
            type: "static_select",
            action_id: ActionType.COMPLETION_NOTICE,
            placeholder: {
              type: "plain_text",
              text: "Projekt auswählen...",
              emoji: true,
            },
            options: options,
          },
        },
      ],
    }),
  };
};
