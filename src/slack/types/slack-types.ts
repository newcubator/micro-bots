import { WebAPICallResult } from '@slack/web-api';
import { ParsedUrlQuery } from 'querystring';

export interface SlackCommandTypes extends ParsedUrlQuery {
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

export interface SlackConversationsListResponse extends WebAPICallResult {
    channels: Channel[];
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
    cache_ts: number;
}

export interface Member {
    id: string;
    team_id: string;
    name: string;
    deleted: boolean;
    color?: string;
    real_name?: string;
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

export interface SlackChatPostMessageResponse extends WebAPICallResult {
    channel: string;
    ts: string;
    message: Message;
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
