import {AxiosResponse} from "axios";

export interface MocoUserType {
    id: string;
    firstname: string;
    lastname: string;
    active: boolean;
    external: boolean;
    email: string;
    mobile_phone: string;
    work_phone: string;
    home_address: string;
    info: string;
    birthday: string;
    avatar_url: string;
    custom_properties: any;
    unit: any;
    created_at: string;
    updated_at: string;
}


export interface MocoSchedulesResponse extends AxiosResponse {
    data: MocoSchedule[];
}

export interface MocoSchedule {
    id: number;
    date: string;
    comment: string;
    am: boolean;
    pm: boolean;
    symbol: number;
    assignment: {
        id: number;
        name: string;
        customer_name: string;
        color: string;
        type: string;
    },
    user: MocoUserType;
    created_at: string;
    updated_at: string;
}

export interface MocoEmploymentsResponse extends AxiosResponse {
    data: MocoEmployment[];
}

export interface MocoEmployment {
    id: number,
    weekly_target_hours: number,
    pattern: { am: number[], pm: number[] },
    from: string,
    to: string,
    user: MocoUserType,
    created_at: string,
    updated_at: string
}

export interface MocoActivityResponse extends AxiosResponse {
    data: MocoActivity[];
}

export interface MocoActivity {
    id: number,
    date: string,
    hours: number,
    description: string,
    billed: boolean,
    billable: boolean,
    tag: string,
    remote_service: string,
    remote_id: string,
    remote_url: string,
    project: {
        id: number,
        name: string,
        billable: boolean
    },
    task: { id: number, name: string, billable: boolean },
    customer: { id: number, name: string },
    user: MocoUserType,
    timer_started_at: string,
    created_at: string,
    updated_at: string,
    hourly_rate: number

}

