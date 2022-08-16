import { APIGatewayEvent } from "aws-lambda";
import axios from "axios";
import { decode } from "querystring";
import { eventBridgeSend } from "../clients/event-bridge";
import { ActionType, BlockAction } from "./types/slack-types";

export const interactionHandler = async (event: APIGatewayEvent) => {
  const blockAction: BlockAction = JSON.parse(decode(event.body).payload as string) as BlockAction;
  let actionType = blockAction.actions[0].action_id;
  console.log(`${actionType} requested`);
  console.log(blockAction);

  let requestedEvent = createRequestedEvent();
  console.log(requestedEvent);

  function createRequestedEvent():
    | CompletionNoticeRequestedEvent
    | LockProjectRequestedEvent
    | ShortMailRequestedEvent
    | UnLockProjectRequestedEvent {
    switch (actionType) {
      case ActionType.LOCK_PROJECT:
        return new LockProjectRequestedEvent({
          projectId: blockAction.actions[0].selected_option.value,
          projectName: blockAction.actions[0].selected_option.text.text,
          responseUrl: blockAction.response_url,
          messageTs: blockAction.container.message_ts,
          channelId: blockAction.container.channel_id,
          actionType: blockAction.actions[0].action_id,
        });
      case ActionType.UNLOCK_PROJECT:
        return new UnLockProjectRequestedEvent({
          projectId: blockAction.actions[0].selected_option.value,
          projectName: blockAction.actions[0].selected_option.text.text,
          responseUrl: blockAction.response_url,
          messageTs: blockAction.container.message_ts,
          channelId: blockAction.container.channel_id,
          actionType,
        });
      case ActionType.COMPLETION_NOTICE:
        return new CompletionNoticeRequestedEvent({
          projectId: blockAction.actions[0].selected_option.value,
          projectName: blockAction.actions[0].selected_option.text.text,
          responseUrl: blockAction.response_url,
          messageTs: blockAction.container.message_ts,
          channelId: blockAction.container.channel_id,
          actionType,
        });
      case ActionType.SHORT_MAIL:
        return new ShortMailRequestedEvent({
          personId: blockAction.state.values.SHORT_MAIL_RECIPIENT.SHORT_MAIL_RECIPIENT.selected_option.value,
          personName: blockAction.state.values.SHORT_MAIL_RECIPIENT.SHORT_MAIL_RECIPIENT.selected_option.text.text,
          message: blockAction.state.values.SHORT_MAIL_TEXT.SHORT_MAIL_TEXT.value || "",
          location: blockAction.state.values.SHORT_MAIL_LOCATION.SHORT_MAIL_LOCATION.selected_option.value,
          responseUrl: blockAction.response_url,
          messageTs: blockAction.container.message_ts,
          channelId: blockAction.container.channel_id,
          sender: blockAction.user.id,
          actionType,
        });
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

  constructor({ projectId, projectName, responseUrl, messageTs, channelId, actionType }) {
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

  constructor({ projectId, projectName, responseUrl, messageTs, channelId, actionType }) {
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

  constructor({ projectId, projectName, responseUrl, messageTs, channelId, actionType }) {
    this.projectId = projectId;
    this.projectName = projectName;
    this.responseUrl = responseUrl;
    this.messageTs = messageTs;
    this.channelId = channelId;
    this.actionId = actionType;
  }
}

export class ShortMailRequestedEvent {
  personId: string;
  personName: string;
  message: string;
  location: string;
  responseUrl: string;
  messageTs: string;
  channelId: string;
  sender: string;
  actionId: ActionType;

  constructor({ personId, personName, message, location, responseUrl, messageTs, channelId, sender, actionType }) {
    this.personId = personId;
    this.personName = personName;
    this.message = message;
    this.location = location;
    this.responseUrl = responseUrl;
    this.messageTs = messageTs;
    this.channelId = channelId;
    this.sender = sender;
    this.actionId = actionType;
  }
}
