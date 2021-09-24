import { APIGatewayEvent } from "aws-lambda";
import { BlockAction } from "../slack/types/slack-types";
import { decode } from "querystring";
import { eventBridgeSend } from "../clients/event-bridge";
import axios from "axios";

export const interactionHandler = async (event: APIGatewayEvent) => {
  const blockAction: BlockAction = JSON.parse(decode(event.body).payload as string) as BlockAction;
  let projectId = blockAction.actions[0].selected_option.value;
  let projectName = blockAction.actions[0].selected_option.text.text;
  console.log(`CompletionNotice requested for project '${projectName} (${projectId})'`);
  console.log(blockAction);

  await eventBridgeSend(
    new CompletionNoticeRequestedEvent(
      projectId,
      projectName,
      blockAction.response_url,
      blockAction.container.message_ts,
      blockAction.container.channel_id
    )
  );

  await axios.post(blockAction.response_url, {
    replace_original: "true",
    text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
  });

  return {
    statusCode: 200,
  };
};

export class CompletionNoticeRequestedEvent {
  projectId: string;
  projectName: string;
  responseUrl: string;
  messageTs: string;
  channelId: string;

  constructor(projectId, projectName, responseUrl, messageTs, channelId) {
    this.projectId = projectId;
    this.projectName = projectName;
    this.responseUrl = responseUrl;
    this.messageTs = messageTs;
    this.channelId = channelId;
  }
}
