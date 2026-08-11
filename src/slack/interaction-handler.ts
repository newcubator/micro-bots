import axios from "axios";
import { decode } from "querystring";
import { dispatchBackgroundTask } from "../background/dispatch";
import { HttpRequest, HttpResponse } from "../http/types";
import { ActionType, BlockAction, MailSignatureFields } from "./types/slack-types";
import {
  createVacationHandoverChecklistBlocks,
  getCompletedVacationHandoverItemIds,
  VACATION_HANDOVER_CHECKLIST_ACTION,
} from "../vacation-handover/checklist";

export const interactionHandler = async (event: HttpRequest): Promise<HttpResponse> => {
  const blockAction: BlockAction = JSON.parse(decode(event.body ?? "").payload as string) as BlockAction;

  const actionType: string = blockAction.actions[0].action_id;

  console.log(`${actionType} requested`);

  let requestedEvent;

  switch (actionType) {
    case VACATION_HANDOVER_CHECKLIST_ACTION: {
      const itemId = blockAction.actions[0].value;
      if (typeof itemId !== "string") {
        return {
          statusCode: 200,
          body: "",
        };
      }

      const completedItemIds = getCompletedVacationHandoverItemIds(blockAction.message?.blocks);
      if (completedItemIds.has(itemId)) {
        completedItemIds.delete(itemId);
      } else {
        completedItemIds.add(itemId);
      }

      await axios.post(blockAction.response_url, {
        replace_original: "true",
        text: "Urlaubsübergabe-Checkliste aktualisiert",
        blocks: createVacationHandoverChecklistBlocks(completedItemIds),
      });

      return {
        statusCode: 200,
        body: "",
      };
    }
    case ActionType.SICK_NOTE: {
      const forSingleDay =
        blockAction.state.values.radio_buttons_days.radio_buttons_action.selected_option.value === "single-day";
      requestedEvent = new SickNoteRequestedEvent({
        channelId: blockAction.container.channel_id,
        actionType,
        responseUrl: blockAction.response_url,
        forSingleDay: forSingleDay,
        startDay: forSingleDay ? null : blockAction.state.values.dates.start_date.selected_date,
        endDay: forSingleDay ? null : blockAction.state.values.dates.end_date.selected_date,
        userId: blockAction.user.id,
        userName: blockAction.user.username,
      });
      break;
    }
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
    case ActionType.MAIL_SIGNATURE: {
      const params = new URLSearchParams({
        user_id: blockAction.user.id,
        user_name: blockAction.user.username || blockAction.user.name,
        signature_type:
          blockAction.state.values[MailSignatureFields.MAIL_SIGNATURE_TYPE][MailSignatureFields.MAIL_SIGNATURE_TYPE]
            .selected_option.value,
        job_title:
          blockAction.state.values[MailSignatureFields.MAIL_SIGNATURE_JOB_TITLE][
            MailSignatureFields.MAIL_SIGNATURE_JOB_TITLE
          ].selected_option.value,
      });

      await axios.post(blockAction.response_url, {
        replace_original: "true",
        text: `Du kannst deine Mail-Signatur unter https://microbots.hubertus.newcubator.com/mailSignatureGenerator?${params.toString()} abrufen.`,
      });

      return {
        statusCode: 200,
        body: "",
      };
    }
    case ActionType.SHORT_MAIL:
      requestedEvent = new ShortMailRequestedEvent({
        personId: blockAction.state.values.SHORT_MAIL_RECIPIENT.SHORT_MAIL_RECIPIENT.selected_option.value,
        personName: blockAction.state.values.SHORT_MAIL_RECIPIENT.SHORT_MAIL_RECIPIENT.selected_option.text.text,
        message: blockAction.state.values.SHORT_MAIL_TEXT.SHORT_MAIL_TEXT.value,
        location: blockAction.state.values.SHORT_MAIL_LOCATION.SHORT_MAIL_LOCATION.selected_option.value,
        responseUrl: blockAction.response_url,
        messageTs: blockAction.container.message_ts,
        channelId: blockAction.container.channel_id,
        sender: blockAction.state.values.SHORT_MAIL_SENDER.SHORT_MAIL_SENDER.selected_user,
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
    case ActionType.CANCEL:
      await axios.post(blockAction.response_url, {
        replace_original: "true",
        text: "Der Brief wird nicht verschickt.",
      });

      return {
        statusCode: 200,
        body: "",
      };
    default:
      console.log("No handle registered for this type of action.");
      return {
        statusCode: 200,
        body: "",
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
      body: "",
    };
  }

  dispatchBackgroundTask(requestedEvent);

  await axios.post(blockAction.response_url, {
    replace_original: "true",
    text: "Vielen Dank für deine Anfrage, ich werde mich sofort darum kümmern. ⏳",
  });

  return {
    statusCode: 200,
    body: "",
  };
};

export class SickNoteRequestedEvent {
  channelId: string;
  actionType: ActionType;
  responseUrl: string;
  forSingleDay: boolean;
  startDay: string | null;
  endDay: string | null;
  userId: string;
  userName: string;

  constructor({ channelId, actionType, responseUrl, forSingleDay, startDay, endDay, userId, userName }: SickNoteEvent) {
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

export class CompletionNoticeRequestedEvent {
  projectId: string;
  projectName: string;
  responseUrl: string;
  messageTs: string;
  channelId: string;
  actionId: ActionType;

  constructor({ projectId, projectName, responseUrl, messageTs, channelId, actionType }: CompletionNoticeEvent) {
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

  constructor({
    personId,
    personName,
    message,
    location,
    responseUrl,
    messageTs,
    channelId,
    sender,
    actionType,
  }: ShortMailEvent) {
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
  channelName: string | null;
  responseUrl: string;
  messageTs: string;
  channelId: string;
  actionId: ActionType;

  constructor({ personId, channelName, responseUrl, messageTs, channelId, actionType }: PrivateChannelEvent) {
    this.personId = personId;
    this.channelName = channelName;
    this.responseUrl = responseUrl;
    this.messageTs = messageTs;
    this.channelId = channelId;
    this.actionId = actionType;
  }
}

type SickNoteEvent = {
  channelId: string;
  actionType: ActionType;
  responseUrl: string;
  forSingleDay: boolean;
  startDay: string | null;
  endDay: string | null;
  userId: string;
  userName: string;
};

type CompletionNoticeEvent = {
  projectId: string;
  projectName: string;
  responseUrl: string;
  messageTs: string;
  channelId: string;
  actionType: ActionType;
};

type ShortMailEvent = {
  personId: string;
  personName: string;
  message: string;
  location: string;
  responseUrl: string;
  messageTs: string;
  channelId: string;
  sender: string;
  actionType: ActionType;
};

type PrivateChannelEvent = {
  personId: string[];
  channelName: string | null;
  responseUrl: string;
  messageTs: string;
  channelId: string;
  actionType: ActionType;
};
