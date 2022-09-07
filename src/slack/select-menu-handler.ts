import { APIGatewayEvent } from "aws-lambda";
import { decode } from "querystring";
import { getAllContacts } from "../moco/contacts";
import { MocoContact, MocoUserType } from "../moco/types/moco-types";
import { getUsers } from "../moco/users";
import { BlockSuggestion } from "./types/slack-types";

let loadAllRecipients: Promise<any> = initAllRecipients();

export const selectMenuHandler = async (event: APIGatewayEvent) => {
  const blockSuggestion: BlockSuggestion = JSON.parse(decode(event.body).payload as string) as BlockSuggestion;
  console.log(blockSuggestion);

  const recipients = await loadAllRecipients;
  const filteredContacts = recipients.filter((person) =>
    person.text.text.toLowerCase().includes(blockSuggestion.value.toLowerCase())
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
          type: "plain_text",
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
        type: "plain_text",
        text: contact.firstname + " " + contact.lastname,
        emoji: true,
      },
    }));
  });

  const all = await Promise.all([contacts, users]);
  return all[0].concat(all[1]);
}
