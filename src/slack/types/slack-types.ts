import { PlainTextElement, WebAPICallResult } from "@slack/web-api";
import { ParsedUrlQuery } from "querystring";

export enum ActionType {
  LOCK_PROJECT = "LOCK_PROJECT",
  UNLOCK_PROJECT = "UNLOCK_PROJECT",
  COMPLETION_NOTICE = "COMPLETION_NOTICE",
  SHORT_MAIL = "SHORT_MAIL",
  PRIVATE_CHANNEL = "PRIVATE_CHANNEL",
  UPLOAD_LETTERXPRESS = "UPLOAD_LETTERXPRESS",
  CANCEL = "CANCEL",
}

export enum ShortMailFields {
  SHORT_MAIL_RECIPIENT = "SHORT_MAIL_RECIPIENT",
  SHORT_MAIL_LOCATION = "SHORT_MAIL_LOCATION",
  SHORT_MAIL_TEXT = "SHORT_MAIL_TEXT",
}

export enum PrivateChannelFields {
  PRIVATE_CHANNEL_USERS = "PRIVATE_CHANNEL_USERS",
  PRIVATE_CHANNEL_NAME = "PRIVATE_CHANNEL_NAME",
}

export interface SlackCommandType extends ParsedUrlQuery {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
}

export interface BlockAction {
  channel: {
    id: string;
    name: string;
  };
  user: User;
  state: State;
  type: "block_actions";
  container: Container;
  response_url: string;
  actions: ElementAction[];
}

export interface BlockSuggestion {
  user: User;
  state: State;
  type: "block_suggestion";
  container: Container;
  value: string;
}

interface User {
  id: string;
  username: string;
  name: string;
  team_id: string;
}

interface State {
  values: any;
}

interface Container {
  type: string;
  message_ts: string;
  channel_id: string;
  is_ephemeral: boolean;
}

interface ElementAction {
  value: any;
  text: any;
  selected_option: {
    text: PlainTextElement;
    value: string;
  };
  action_id: string;
}

export interface Channel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  created: number;
  is_archived: boolean;
  is_general: boolean;
  unlinked: number;
  name_normalized: string;
  is_shared: boolean;
  parent_conversation: null;
  creator: string;
  is_ext_shared: boolean;
  is_org_shared: boolean;
  shared_team_ids: string[];
  pending_shared: any[];
  pending_connected_team_ids: any[];
  is_pending_ext_shared: boolean;
  is_member: boolean;
  is_private: boolean;
  is_mpim: boolean;
  topic: Purpose;
  purpose: Purpose;
  num_members: number;
}

export interface Purpose {
  value: string;
  creator: string;
  last_set: number;
}

export interface Member {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  color?: string;
  real_name?: string;
  tz?: string;
  tz_label?: string;
  tz_offset?: number;
  profile: Profile;
  is_admin?: boolean;
  is_owner?: boolean;
  is_primary_owner?: boolean;
  is_restricted?: boolean;
  is_ultra_restricted?: boolean;
  is_bot: boolean;
  is_app_user: boolean;
  updated: number;
  is_email_confirmed?: boolean;
  is_invited_user?: boolean;
}

export interface Profile {
  title: string;
  phone: string;
  skype: string;
  real_name: string;
  real_name_normalized: string;
  display_name: string;
  display_name_normalized: string;
  fields: null;
  status_text: string;
  status_emoji: string;
  status_expiration: number;
  avatar_hash: string;
  always_active?: boolean;
  first_name?: string;
  last_name?: string;
  image_24: string;
  image_32: string;
  image_48: string;
  image_72: string;
  image_192: string;
  image_512: string;
  status_text_canonical: string;
  team: string;
  image_original?: string;
  is_custom_image?: boolean;
  email?: string;
  image_1024?: string;
  api_app_id?: string;
  bot_id?: string;
}

export interface Message {
  type: string;
  subtype: string;
  text: string;
  ts: string;
  username: string;
  icons: Icons;
  bot_id: string;
}

export interface Icons {
  emoji: string;
  image_64: string;
}

export interface SlackConversationsListResponse extends WebAPICallResult {
  channels: Channel[];
}

export interface SlackConversationsMembersResponse extends WebAPICallResult {
  members: string[];
}

export interface SlackConversationsInviteResponse extends WebAPICallResult {
  channel: Channel;
}

export interface SlackConversationsCreateResponse extends WebAPICallResult {
  channel: Channel;
}

export interface SlackUsersListResponse extends WebAPICallResult {
  members: Member[];
}

export interface SlackChatPostMessageResponse extends WebAPICallResult {
  channel: string;
  message: Message;
}
export interface SlackChatPostEphemeralResponse extends WebAPICallResult {
  channel: string;
  message: Message;
}

export const EXAMPLE_MEMBER_JOHN: Member = {
  id: "U012AB34CD",
  team_id: "T112AB34",
  name: "doe.john",
  deleted: false,
  color: "84b22f",
  real_name: "John Doe",
  tz: "Europe/Amsterdam",
  tz_label: "Central European Time",
  tz_offset: 3600,
  profile: {
    title: "",
    phone: "",
    skype: "",
    real_name: "John Doe",
    real_name_normalized: "John Doe",
    display_name: "John Doe",
    display_name_normalized: "John Doe",
    fields: null,
    status_text: "",
    status_emoji: "",
    status_expiration: 0,
    avatar_hash: "6fbd69422864",
    email: "john.doe@example.com",
    image_24:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-24.png",
    image_32:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=32&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-32.png",
    image_48:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=48&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-48.png",
    image_72:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-72.png",
    image_192:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-192.png",
    image_512:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-512.png",
    status_text_canonical: "",
    team: "T112AB34",
  },
  is_admin: false,
  is_owner: false,
  is_primary_owner: false,
  is_restricted: false,
  is_ultra_restricted: false,
  is_bot: false,
  is_app_user: false,
  updated: 1615276440,
  is_email_confirmed: true,
};

export const EXAMPLE_MEMBER_JANE: Member = {
  id: "U056EF78GH",
  team_id: "T112AB34",
  name: "doe.jane",
  deleted: false,
  color: "4ec0d6",
  real_name: "Jane Doe",
  tz: "Europe/Amsterdam",
  tz_label: "Central European Time",
  tz_offset: 3600,
  profile: {
    title: "",
    phone: "",
    skype: "",
    real_name: "Jane Doe",
    real_name_normalized: "Jane Doe",
    display_name: "Jane Doe",
    display_name_normalized: "Jane Doe",
    fields: null,
    status_text: "",
    status_emoji: "",
    status_expiration: 0,
    avatar_hash: "gdbb715b5a24",
    email: "jane.doe@example.com",
    image_24:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-24.png",
    image_32:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=32&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-32.png",
    image_48:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=48&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-48.png",
    image_72:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-72.png",
    image_192:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-192.png",
    image_512:
      "https://secure.gravatar.com/avatar/dbb715b5a249e6908f6a89a28508d47b.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0025-512.png",
    status_text_canonical: "",
    team: "T112AB34",
  },
  is_admin: false,
  is_owner: false,
  is_primary_owner: false,
  is_restricted: false,
  is_ultra_restricted: false,
  is_bot: false,
  is_app_user: false,
  updated: 1615805648,
  is_email_confirmed: true,
};

export const EXAMPLE_CHANNEL_BIRTHDAY_JANE: Channel = {
  id: "C012AB34CD",
  name: "birthday-jane-doe",
  is_channel: true,
  is_group: false,
  is_im: false,
  created: 1615803580,
  is_archived: true,
  is_general: false,
  unlinked: 0,
  name_normalized: "birthday-jane-doe",
  is_shared: false,
  parent_conversation: null,
  creator: "U012AB34CD",
  is_ext_shared: false,
  is_org_shared: false,
  shared_team_ids: ["T112AB34"],
  pending_shared: [],
  pending_connected_team_ids: [],
  is_pending_ext_shared: false,
  is_member: true,
  is_private: true,
  is_mpim: false,
  topic: {
    value: "",
    creator: "",
    last_set: 0,
  },
  purpose: {
    value: "",
    creator: "",
    last_set: 0,
  },
  num_members: 2,
};

export const EXAMPLE_CHANNEL_NO_BIRTHDAY: Channel = {
  id: "C056AB78CD",
  name: "channel-example",
  is_channel: true,
  is_group: false,
  is_im: false,
  created: 1615803580,
  is_archived: true,
  is_general: false,
  unlinked: 0,
  name_normalized: "channel-example",
  is_shared: false,
  parent_conversation: null,
  creator: "U012AB34CD",
  is_ext_shared: false,
  is_org_shared: false,
  shared_team_ids: ["T112AB34"],
  pending_shared: [],
  pending_connected_team_ids: [],
  is_pending_ext_shared: false,
  is_member: true,
  is_private: true,
  is_mpim: false,
  topic: {
    value: "",
    creator: "",
    last_set: 0,
  },
  purpose: {
    value: "",
    creator: "",
    last_set: 0,
  },
  num_members: 2,
};

export const EXAMPLE_MESSAGE: Message = {
  type: "message",
  subtype: "bot_message",
  text: "Hey Leute! John Doe hat in 21 Tagen am 14 MAR Geburtstag! Habt ihr euch bereits über eine kleine Überraschung Gedanken gemacht?",
  ts: "1615824467.003700",
  username: "Birthday Bot",
  icons: {
    emoji: ":birthday:",
    image_64: "https://a.slack-edge.com/production-standard-emoji-assets/13.0/apple-large/1f382.png",
  },
  bot_id: "B012AB34CD",
};

export const EXAMPLE_SLACK_CONVERSATIONS_LIST_RESPONSE: SlackConversationsListResponse = {
  ok: true,
  channels: [EXAMPLE_CHANNEL_BIRTHDAY_JANE, EXAMPLE_CHANNEL_NO_BIRTHDAY],
};

export const EXAMPLE_SLACK_CONVERSATIONS_MEMBERS_RESPONSE: SlackConversationsMembersResponse = {
  ok: true,
  members: [EXAMPLE_MEMBER_JOHN.id, EXAMPLE_MEMBER_JANE.id],
};

export const EXAMPLE_SLACK_CONVERSATIONS_INVITE_RESPONSE: SlackConversationsInviteResponse = {
  ok: true,
  channel: EXAMPLE_CHANNEL_BIRTHDAY_JANE,
};

export const EXAMPLE_SLACK_CONVERSATIONS_CREATE_RESPONSE: SlackConversationsCreateResponse = {
  ok: true,
  channel: EXAMPLE_CHANNEL_BIRTHDAY_JANE,
};

export const EXAMPLE_SLACK_USERS_LIST_RESPONSE: SlackUsersListResponse = {
  ok: true,
  members: [EXAMPLE_MEMBER_JOHN, EXAMPLE_MEMBER_JANE],
};

export const EXAMPLE_SLACK_CHAT_POST_MESSAGE_RESPONSE: SlackChatPostMessageResponse = {
  ok: true,
  message: EXAMPLE_MESSAGE,
  channel: EXAMPLE_CHANNEL_BIRTHDAY_JANE.id,
};
