import { UnLockProjectRequestedEvent } from "../slack/interaction-handler";
import { EventBridgeEvent } from "aws-lambda";
import { getProject, putProjectContract } from "../moco/projects";
import { slackClient } from "../clients/slack";
import axios from "axios";

export const eventHandler = async (event: EventBridgeEvent<string, UnLockProjectRequestedEvent>) => {
  console.log(`Handling event ${JSON.stringify(event.detail)}`);

  const project = await getProject(event.detail.projectId);

  await Promise.all(
    project.contracts.map((contract) =>
      putProjectContract(event.detail.projectId, {
        ...contract,
        active: true,
      })
    )
  );

  // Only user/bots that have joined a channel can post fiels
  console.log(
    await slackClient.conversations.join({
      channel: event.detail.channelId,
    })
  );

  console.log(
    await axios.post(event.detail.responseUrl, {
      replace_original: "true",
      text: `Das Projekt '${project.name}' ist jetzt entgesperrt!`,
    })
  );
};
