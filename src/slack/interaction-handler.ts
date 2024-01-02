import { APIGatewayEvent, APIGatewayProxyEventQueryStringParameters } from 'aws-lambda';
import axios from "axios";
import { decode } from "querystring";
import { eventBridgeSend } from "../clients/event-bridge";
import { ActionType, BlockAction } from "./types/slack-types";

export const interactionHandler = async (event: APIGatewayEvent) => {
  const blockAction: BlockAction = JSON.parse(decode(event.body).payload as string) as BlockAction;

  const actionType: string = blockAction.actions[0].action_id;
  console.log(JSON.stringify(event))
  console.log(`${actionType} requested`);

  console.log(JSON.stringify(blockAction))

  let requestedEvent;

  switch (actionType) {
    case ActionType.SICK_NOTE:
      const forSingleDay = blockAction.state.values.radio_buttons_days.radio_buttons_action.selected_option.value === "single-day";
      requestedEvent = new SickNoteRequestedEvent({
        channelId: blockAction.container.channel_id,
        actionType,
        responseUrl: blockAction.response_url,
        forSingleDay: forSingleDay,
        startDay: forSingleDay ? null : blockAction.state.values.dates.start_date.selected_date,
        endDay: forSingleDay? null : blockAction.state.values.dates.end_date.selected_date,
        userId: blockAction.user.id,
        userName: blockAction.user.username
      });
      break;
    case ActionType.BOOK_SUPPORT:
      requestedEvent = new AiBookDemoRequestedEvent({
        text: blockAction.actions[0].value,
        responseUrl: blockAction.response_url,
        channelId: blockAction.container.channel_id,
        actionType: blockAction.actions[0].action_id,
        createIndex: blockAction.actions[0].value.startsWith("CREATE"),
      });
      break;
    case ActionType.KWS_EXCEL_EXPORT:
      requestedEvent = new KWSExcelExportRequestedEvent({
        projectId: blockAction.actions[0].selected_option.value,
        projectName: blockAction.actions[0].selected_option.text.text,
        responseUrl: blockAction.response_url,
        messageTs: blockAction.container.message_ts,
        channelId: blockAction.container.channel_id,
        actionType: blockAction.actions[0].action_id,
      });
      break;
    case ActionType.LOCK_PROJECT:
      requestedEvent = new LockProjectRequestedEvent({
        projectId: blockAction.actions[0].selected_option.value,
        projectName: blockAction.actions[0].selected_option.text.text,
        responseUrl: blockAction.response_url,
        messageTs: blockAction.container.message_ts,
        channelId: blockAction.container.channel_id,
        actionType: blockAction.actions[0].action_id,
      });
      break;
    case ActionType.UNLOCK_PROJECT:
      requestedEvent = new UnLockProjectRequestedEvent({
        projectId: blockAction.actions[0].selected_option.value,
        projectName: blockAction.actions[0].selected_option.text.text,
        responseUrl: blockAction.response_url,
        messageTs: blockAction.container.message_ts,
        channelId: blockAction.container.channel_id,
        actionType,
      });
      break;
    case ActionType.COMPLETION_NOTICE:
      requestedEvent = new CompletionNoticeRequestedEvent({
        projectId: blockAction.actions[0].selected_option.value,
        projectName: blockAction.actions[0].selected_option.text.text,
        responseUrl: blockAction.response_url,
        messageTs: blockAction.container.message_ts,
        channelId: blockAction.container.channel_id,
        actionType,
      });
      break;
    case ActionType.SHORT_MAIL:
      requestedEvent = new ShortMailRequestedEvent({
        personId: blockAction.state.values.SHORT_MAIL_RECIPIENT.SHORT_MAIL_RECIPIENT.selected_option.value,
        personName: blockAction.state.values.SHORT_MAIL_RECIPIENT.SHORT_MAIL_RECIPIENT.selected_option.text.text,
        message: blockAction.state.values.SHORT_MAIL_TEXT.SHORT_MAIL_TEXT.value,
        location: blockAction.state.values.SHORT_MAIL_LOCATION.SHORT_MAIL_LOCATION.selected_option.value,
        responseUrl: blockAction.response_url,
        messageTs: blockAction.container.message_ts,
        channelId: blockAction.container.channel_id,
        sender: blockAction.user.id,
        actionType,
      });
      break;
    case ActionType.PRIVATE_CHANNEL:
      requestedEvent = new PrivateChannelRequestedEvent({
        personId: blockAction.state.values.PRIVATE_CHANNEL_USERS.PRIVATE_CHANNEL_USERS.selected_users,
        channelName: blockAction.state.values.PRIVATE_CHANNEL_NAME.PRIVATE_CHANNEL_NAME.value,
        responseUrl: blockAction.response_url,
        messageTs: blockAction.container.message_ts,
        channelId: blockAction.container.channel_id,
        actionType,
      });
      break;
    case ActionType.UPLOAD_LETTERXPRESS:
      requestedEvent = new UploadLetterXpressEvent({
        file: blockAction.actions[0].value,
        responseUrl: blockAction.response_url,
        channelId: blockAction.container.channel_id,
        sender: blockAction.user.id,
      });
      break;
    case ActionType.CANCEL:
      await axios.post(blockAction.response_url, {
        replace_original: "true",
        text: "Der Brief wird nicht verschickt.",
      });

      return {
        statusCode: 200,
      };
    default:
      console.log("No handle registered for this type of action.");
      return {
        statusCode: 200,
      };
  }
  if (
    blockAction.channel.name === "privategroup" &&
    (actionType === ActionType.SHORT_MAIL || actionType === ActionType.COMPLETION_NOTICE)
  ) {
    await axios.post(blockAction.response_url, {
      replace_original: "true",
      text: "Vielen Dank für deine Anfrage, ich kann das leider nicht in einem privaten Channel tun, bitte gehe dazu in einen öffentlichen Channel.",
    });

    return {
      statusCode: 200,
    };
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

export class KWSExcelExportRequestedEvent {
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

export class SickNoteRequestedEvent {
  channelId: string;
  actionType: ActionType;
  responseUrl: string;
  forSingleDay: boolean;
  startDay: string | null;
  endDay: string | null;
  userId: string;
  userName: string;

  constructor({ channelId, actionType, responseUrl, forSingleDay, startDay, endDay, userId, userName }) {
    this.channelId = channelId;
    this.actionType = actionType;
    this.responseUrl = responseUrl;
    this.forSingleDay = forSingleDay;
    this.startDay = startDay;
    this.endDay = endDay;
    this.userId = userId;
    this.userName = userName;
  }
}

export class AiBookDemoRequestedEvent {
  text: string;
  channelId: string;
  actionType: ActionType;
  responseUrl: string;
  createIndex: boolean;

  constructor({ text, channelId, actionType, responseUrl, createIndex }) {
    this.text = text;
    this.channelId = channelId;
    this.actionType = actionType;
    this.responseUrl = responseUrl;
    this.createIndex = createIndex;
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

export class PrivateChannelRequestedEvent {
  personId: string[];
  channelName: string;
  responseUrl: string;
  messageTs: string;
  channelId: string;
  actionId: ActionType;

  constructor({ personId, channelName, responseUrl, messageTs, channelId, actionType }) {
    this.personId = personId;
    this.channelName = channelName;
    this.responseUrl = responseUrl;
    this.messageTs = messageTs;
    this.channelId = channelId;
    this.actionId = actionType;
  }
}

export class UploadLetterXpressEvent {
  file: string;
  responseUrl: string;
  channelId: string;
  sender: string;

  constructor({ file, responseUrl, channelId, sender }) {
    this.file = file;
    this.responseUrl = responseUrl;
    this.channelId = channelId;
    this.sender = sender;
  }
}
