import { APIGatewayEvent } from "aws-lambda";
import axios from "axios";
import { decode } from "querystring";
import { eventBridgeSend } from "../clients/event-bridge";
import { ActionType, BlockAction } from "./types/slack-types";

export const interactionHandler = async (event: APIGatewayEvent) => {
  const blockAction: BlockAction = JSON.parse(decode(event.body).payload as string) as BlockAction;
  let projectId = blockAction.actions[0].selected_option.value;
  let projectName = blockAction.actions[0].selected_option.text.text;
  let actionType = blockAction.actions[0].action_id;
  console.log(`Lock-project requested for project '${projectName} (${projectId})'`);
  console.log(blockAction);
  console.log(projectId);
  console.log(actionType);

  let requestedEvent = createRequestedEvent();

  function createRequestedEvent():
    | CompletionNoticeRequestedEvent
    | LockProjectRequestedEvent
    | UnLockProjectRequestedEvent {
    switch (actionType) {
      case ActionType.LOCK_PROJECT:
        return new LockProjectRequestedEvent(
          projectId,
          projectName,
          blockAction.response_url,
          blockAction.container.message_ts,
          blockAction.container.channel_id,
          actionType
        );
      case ActionType.UNLOCK_PROJECT:
        return new UnLockProjectRequestedEvent(
          projectId,
          projectName,
          blockAction.response_url,
          blockAction.container.message_ts,
          blockAction.container.channel_id,
          actionType
        );
      case ActionType.COMPLETION_NOTICE:
        return new CompletionNoticeRequestedEvent(
          projectId,
          projectName,
          blockAction.response_url,
          blockAction.container.message_ts,
          blockAction.container.channel_id,
          actionType
        );
    }
  }

  await eventBridgeSend(requestedEvent);

  await axios.post(blockAction.response_url, {
    replace_original: "true",
    text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
  });

  return {
    statusCode: 200,
  };
};

export class LockProjectRequestedEvent {
  projectId: string;
  projectName: string;
  responseUrl: string;
  messageTs: string;
  channelId: string;
  actionId: ActionType;

  constructor(projectId, projectName, responseUrl, messageTs, channelId, actionType) {
    this.projectId = projectId;
    this.projectName = projectName;
    this.responseUrl = responseUrl;
    this.messageTs = messageTs;
    this.channelId = channelId;
    this.actionId = actionType;
  }
}

export class CompletionNoticeRequestedEvent {
  projectId: string;
  projectName: string;
  responseUrl: string;
  messageTs: string;
  channelId: string;
  actionId: ActionType;

  constructor(projectId, projectName, responseUrl, messageTs, channelId, actionType) {
    this.projectId = projectId;
    this.projectName = projectName;
    this.responseUrl = responseUrl;
    this.messageTs = messageTs;
    this.channelId = channelId;
    this.actionId = actionType;
  }
}

export class UnLockProjectRequestedEvent {
  projectId: string;
  projectName: string;
  responseUrl: string;
  messageTs: string;
  channelId: string;
  actionId: ActionType;

  constructor(projectId, projectName, responseUrl, messageTs, channelId, actionType) {
    this.projectId = projectId;
    this.projectName = projectName;
    this.responseUrl = responseUrl;
    this.messageTs = messageTs;
    this.channelId = channelId;
    this.actionId = actionType;
  }
}
