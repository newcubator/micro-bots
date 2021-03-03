import { WebAPICallResult } from '@slack/web-api';

export interface BirthdayType {
    id: number;
    firstname: string;
    lastname: string;
    active: boolean;
    extern: boolean;
    email: string;
    mobile_phone: string;
    work_phone: string;
    home_address: string;
    info: string;
    birthday: string;
    avatar_url: string;
    custom_properties: { SlackId: string, Standort: string };
    unit: { id: number, name: string };
    created_at: string;
    updated_at: string;
}

export interface UserResponseType extends WebAPICallResult {
    ok: boolean;
    members: UserResponseMember[];
}

export interface UserResponseMember {
    id: string;
    team_id: string;
    name: string;
    deleted: boolean;
    color: string;
    real_name: string;
    tz: string;
    tz_label: string;
    tz_offset: number;
    profile: UserResponseMemberProfile;
    is_admin: boolean;
    is_owner: boolean;
    is_primary_owner: boolean;
    is_restricted: boolean;
    is_ultra_restricted: boolean;
    is_bot: boolean;
    is_app_user: boolean;
    updated: number;
}

interface UserResponseMemberProfile {
    title: string;
    phone: string;
    skype: string;
    real_name: string;
    real_name_normalized: string;
    display_name: string;
    display_name_normalized: string;
    fields: any;
    status_text: string;
    status_emoji: string;
    status_expiration: number;
    avatar_hash: string;
    always_active: boolean;
    email: string;
    first_name: string;
    last_name: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
    status_text_canonical: string;
    team: string;
}

export interface ChannelResponseType extends WebAPICallResult {
    ok: boolean,
    channel: {
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
        last_read: string;
        topic: { value: string, creator: string, last_set: number };
        purpose: { value: string, creator: string, last_set: number };
        previous_names: any[];
        priority: number;
    };
    response_metadata: {
        scopes: string[];
        acceptedScopes: string[];
    };
}

export interface MessageResponseType extends WebAPICallResult {
    ok: boolean;
    channel: string;
    ts: string;
    message: {
        type: string;
        subtype: string;
        text: string;
        ts: string;
        username: string;
        icons: { emoji: string };
        bot_id: string;
    };
    response_metadata: {
        scopes: string[];
        acceptedScopes: string[];
    };
}
