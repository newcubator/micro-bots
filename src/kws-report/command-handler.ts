import { ActionType } from "../slack/types/slack-types";
import { getProjects } from "../moco/projects";
import { MocoProject } from "../moco/types/moco-types";

export const commandHandler = async () => {
  const projects = await getProjects({ include_archived: false });
  const options = projects
    .slice(0, 100)
    .filter((project: MocoProject) => project.customer.name.toLowerCase().includes("kws"))
    .map((project: MocoProject) => {
      return {
        value: project.id.toString(),
        text: {
          type: "plain_text",
          text: project.name.substring(0, 75),
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
            options: options,
          },
        },
      ],
    }),
  };
};
