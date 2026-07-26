import { PlainTextOption } from "@slack/web-api";
import { decode } from "querystring";
import { HttpRequest, HttpResponse } from "../http/types";
import { getAllContacts } from "../moco/contacts";
import { MocoContact, MocoUserType } from "../moco/types/moco-types";
import { getUsers } from "../moco/users";
import { BlockSuggestion } from "./types/slack-types";

let recipients: Promise<PlainTextOption[]> | undefined;

const loadAllRecipients = () => {
  if (!recipients) {
    recipients = initAllRecipients().catch((error) => {
      recipients = undefined;
      console.error(
        JSON.stringify({
          service: "micro-bots",
          status: "recipient_load_failed",
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      throw error;
    });
  }
  return recipients;
};

export const selectMenuHandler = async (event: HttpRequest): Promise<HttpResponse> => {
  const blockSuggestion: BlockSuggestion = JSON.parse(decode(event.body ?? "").payload as string) as BlockSuggestion;

  const allRecipients = await loadAllRecipients();
  const filteredContacts = allRecipients.filter((person) =>
    person.text.text.toLowerCase().includes(blockSuggestion.value.toLowerCase()),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      options: filteredContacts,
    }),
  };
};

export async function initAllRecipients() {
  const contacts = getAllContacts().then((contacts: MocoContact[]) => {
    return contacts.map((contact) => {
      return {
        value: contact.id.toString(),
        text: {
          type: "plain_text" as const,
          text: contact.firstname + " " + contact.lastname,
          emoji: true,
        },
      };
    });
  });

  const users = getUsers().then((contacts: MocoUserType[]) => {
    return contacts.map((contact) => ({
      value: contact.id.toString(),
      text: {
        type: "plain_text" as const,
        text: contact.firstname + " " + contact.lastname,
        emoji: true,
      },
    }));
  });

  const all = await Promise.all([contacts, users]);
  return all[0].concat(all[1]);
}
