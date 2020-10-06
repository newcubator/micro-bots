import {AxiosResponse} from "axios";

interface MocoUser { id: number; firstname: string; lastname: string; }

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
    user: MocoUser;
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
    user: MocoUser,
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
    user: MocoUser,
    timer_started_at: string,
    created_at: string,
    updated_at: string,
    hourly_rate: number

}

