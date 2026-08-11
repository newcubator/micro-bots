import axios, { AxiosResponse } from "axios";
import { SlackCommandType } from "../slack/types/slack-types";
import { MOCO_TOKEN } from "./token";
import { MocoUserType } from "./types/moco-types";

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/users.md
 */

export function getUsers(): Promise<Array<MocoUserType>> {
  return axios
    .get("https://newcubator.mocoapp.com/api/v1/users", {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
      params: {
        include_archived: true,
      },
    })
    .then((response: AxiosResponse<Array<MocoUserType>>) => {
      console.info(`Loaded ${response.data.length} users`);
      return response.data;
    })
    .catch((error) => {
      console.error("Error while loading moco users!");
      throw error;
    });
}

export async function getUserById(id: string) {
  return axios
    .get<MocoUserType>(`https://newcubator.mocoapp.com/api/v1/users/${id}`, {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
    })
    .then((response) => response.data);
}

export function findUserBySlackCommand(
  command:
    | Pick<SlackCommandType, "user_id" | "user_name">
    | { user_id?: string | string[]; user_name?: string | string[] },
): (users: Array<MocoUserType>) => MocoUserType | undefined {
  return (users: Array<MocoUserType>): MocoUserType | undefined => {
    return findUserBySlackIdentity(users, command);
  };
}

export function findUserBySlackIdentity(
  users: Array<MocoUserType>,
  identity: {
    user_id?: string | string[];
    user_name?: string | string[];
    user_email?: string;
    real_name?: string;
    display_name?: string;
  },
): MocoUserType | undefined {
  return (
    findUserBySlackId(users, identity.user_id) ||
    findUserByMail(users, identity.user_email) ||
    findUserByMailPrefix(users, identity.user_name) ||
    findUserByNormalizedMailPrefix(users, identity.user_name) ||
    findUserByName(users, identity.real_name) ||
    findUserByName(users, identity.display_name)
  );
}

function findUserBySlackId(
  users: Array<MocoUserType>,
  slackId: string | string[] | undefined,
): MocoUserType | undefined {
  const normalizedSlackId = normalize(slackId);
  if (!normalizedSlackId) return undefined;

  return users.find((user) => normalize(user.custom_properties?.SlackId) === normalizedSlackId);
}

function findUserByMail(users: Array<MocoUserType>, email: string | undefined): MocoUserType | undefined {
  const normalizedEmail = normalize(email);
  if (!normalizedEmail) return undefined;

  return users.find((user) => normalize(user.email) === normalizedEmail);
}

function findUserByMailPrefix(
  users: Array<MocoUserType>,
  prefix: string | string[] | undefined,
): MocoUserType | undefined {
  const normalizedPrefix = normalize(prefix);
  if (!normalizedPrefix) return undefined;

  return users.find((user) => normalize(getMailPrefix(user.email)) === normalizedPrefix);
}

function findUserByNormalizedMailPrefix(
  users: Array<MocoUserType>,
  prefix: string | string[] | undefined,
): MocoUserType | undefined {
  const normalizedPrefix = normalizeHandle(prefix);
  if (!normalizedPrefix) return undefined;

  return users.find((user) => normalizeHandle(getMailPrefix(user.email)) === normalizedPrefix);
}

function findUserByName(users: Array<MocoUserType>, name: string | undefined): MocoUserType | undefined {
  const normalizedName = normalizeName(name);
  if (!normalizedName) return undefined;

  return users.find((user) => normalizeName(`${user.firstname} ${user.lastname}`) === normalizedName);
}

function getMailPrefix(email: string): string {
  return email.split("@")[0];
}

function normalize(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value.trim().toLowerCase() : undefined;
}

function normalizeHandle(value: string | string[] | undefined): string | undefined {
  return normalize(value)?.replace(/[^a-z0-9]/g, "");
}

function normalizeName(value: string | undefined): string | undefined {
  return normalize(value)
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
