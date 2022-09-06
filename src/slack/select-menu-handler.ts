import { APIGatewayEvent } from "aws-lambda";
import { decode } from "querystring";
import { getAllContacts, getContacts } from "../moco/contacts";
import { getUsers } from "../moco/users";
import { BlockSuggestion } from "./types/slack-types";

let contacts;
let users;

export const selectMenuHandler = async (event: APIGatewayEvent) => {
  const blockSuggestion: BlockSuggestion = JSON.parse(decode(event.body).payload as string) as BlockSuggestion;
  console.log(blockSuggestion);

  contacts = await getAllContacts();
  console.log("Anzahl:" + contacts.length);
  users = await getUsers();
  const people = contacts.concat(users);

  let filteredContacts = people
    .filter((person) =>
      (person.firstname + person.lastname).toLowerCase().includes(blockSuggestion.value.toLowerCase())
    )
    .map((contact) => {
      return {
        value: contact.id.toString(),
        text: {
          type: "plain_text",
          text: contact.firstname + " " + contact.lastname,
          emoji: true,
        },
      };
    });
  console.log(JSON.stringify(filteredContacts));
  return {
    statusCode: 200,
    body: JSON.stringify({
      options: filteredContacts,
    }),
  };
};
