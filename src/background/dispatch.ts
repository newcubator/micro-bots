import axios from "axios";
import { eventHandler as completionNoticeEventHandler } from "../completion-notice/event-handler";
import { eventHandler as privateChannelEventHandler } from "../private-channel/event-handler";
import { eventHandler as shortMailEventHandler } from "../short-mail/event-handler";
import {
  CompletionNoticeRequestedEvent,
  PrivateChannelRequestedEvent,
  ShortMailRequestedEvent,
  SickNoteRequestedEvent,
} from "../slack/interaction-handler";
import { eventHandler as sickNoteEventHandler } from "../sick-note/event-handler";
import { runBackgroundTask } from "./run-background-task";

type RequestedEvent =
  | CompletionNoticeRequestedEvent
  | PrivateChannelRequestedEvent
  | ShortMailRequestedEvent
  | SickNoteRequestedEvent;

export const dispatchBackgroundTask = (event: RequestedEvent) => {
  const eventType = event.constructor.name;
  const context = {
    slackChannelId: event.channelId,
    slackUserId: event instanceof SickNoteRequestedEvent ? event.userId : undefined,
  };

  const run = () => {
    if (event instanceof CompletionNoticeRequestedEvent) return completionNoticeEventHandler(event);
    if (event instanceof PrivateChannelRequestedEvent) return privateChannelEventHandler(event);
    if (event instanceof ShortMailRequestedEvent) return shortMailEventHandler(event);
    return sickNoteEventHandler(event);
  };

  runBackgroundTask({
    eventType,
    context,
    run,
    onError: async (operationId) => {
      await axios.post(event.responseUrl, {
        replace_original: "true",
        text: `Bei der Verarbeitung ist ein Fehler aufgetreten. Bitte versuche es erneut. Vorgangsnummer: ${operationId}`,
      });
    },
  });
};
