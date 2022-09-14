import { getProjects } from "../moco/projects";
import { ActionType } from "../slack/types/slack-types";

export const commandHandler = async () => {
  const projects = await getProjects({ include_archived: false });
  const options = projects
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
        text: "Konnte keine Projekte finden.",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      text: "Lock project angefragt",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Ich sperre gerne für dich ein Projekt. Wähle dazu bitte rechts das gewünschte Projekt aus und ich mache mich sofort an die Arbeit.",
          },
          accessory: {
            type: "static_select",
            action_id: ActionType.LOCK_PROJECT,
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
