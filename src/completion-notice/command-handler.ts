import { APIGatewayEvent } from "aws-lambda";
import { getProjects } from "../moco/projects";

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
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Ich erstelle dir gerne einen Stundenzettel. Wähle dazu bitte links das gewünschte Projekt aus und ich mache mich sofort an die Arbeit.",
          },
          accessory: {
            type: "static_select",
            action_id: "completionNotice",
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
