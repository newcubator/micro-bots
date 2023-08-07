import { UnLockProjectRequestedEvent } from "../slack/interaction-handler";
import { EventBridgeEvent } from "aws-lambda";
import { getProject, putProjectContract } from "../moco/projects";
import axios from "axios";

export const eventHandler = async (event: EventBridgeEvent<string, UnLockProjectRequestedEvent>) => {
  console.log(`Handling event ${JSON.stringify(event.detail)}`);

  const project = await getProject(event.detail.projectId);

  await Promise.all(
    project.contracts.map((contract) =>
      putProjectContract(event.detail.projectId, {
        ...contract,
        active: true,
      }),
    ),
  );

  console.log(
    await axios.post(event.detail.responseUrl, {
      replace_original: "true",
      text: `Das Projekt '${project.name}' ist jetzt entsperrt!`,
    }),
  );
};
