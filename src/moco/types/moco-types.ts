interface genericIdString {
    id: string;
    name: string;
}

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
    };
    user: MocoUserType;
    created_at: string;
    updated_at: string;
}

export interface MocoEmployment {
    id: number;
    weekly_target_hours: number;
    pattern: {
        am: number[];
        pm: number[];
    };
    from: string;
    to: string;
    user: MocoUserType;
    created_at: string;
    updated_at: string;
}

export interface MocoActivity {
    id: number;
    date: string;
    hours: number;
    description: string;
    billed: boolean;
    billable: boolean;
    tag: string;
    remote_service: string;
    remote_id: string;
    remote_url: string;
    project: {
        id: number;
        name: string;
        billable: boolean;
    };
    task: {
        id: number;
        name: string;
        billable: boolean;
    };
    customer: genericIdString;
    user: MocoUserType;
    timer_started_at: string;
    created_at: string;
    updated_at: string;
    hourly_rate: number;
}

export interface MocoProject {
    id: number;
    identifier: string;
    name: string;
    active: boolean;
    billable: boolean;
    fixed_price: boolean;
    finish_date: Date;
    currency: string;
    billing_variant: string;
    billing_address: string;
    billing_email_to: null;
    billing_email_cc: null;
    billing_notes: null;
    setting_include_time_report: boolean;
    budget: number;
    budget_expenses: number;
    hourly_rate: number;
    info: string;
    tags: any[];
    labels: any[];
    custom_properties: {
        Bestellnummer: string;
    };
    leader: Leader;
    customer: genericIdString;
    tasks: Task[];
    contracts: MocoContract[];
    deal: genericIdString;
    created_at: Date;
    updated_at: Date;
}

export interface MocoContract {
    id: number;
    user_id: number;
    firstname: string;
    lastname: string;
    billable: boolean;
    active: boolean;
    budget: null;
    hourly_rate: number;
}

export interface Leader {
    id: number;
    firstname: string;
    lastname: string;
}

export interface Task {
    id: number;
    name: string;
    billable: boolean;
    active: boolean;
    budget: null;
    hourly_rate: number;
}

export interface MocoDeal {
    id: number;
    name: string;
    status: string;
    reminder_date: Date;
    closed_on: Date;
    money: number;
    currency: string;
    info: string;
    tags: any[];
    custom_properties: {};
    user: {
        id: string;
        firstname: string;
        lastname: string;
    };
    person: genericIdString;
    customer: genericIdString;
    company: {
        id: string;
        type: string;
        name: string;
    };
    category: {
        id: number;
        name: string;
        probability: number;
    };
    created_at: Date;
    updated_at: Date;
}

export interface MocoContact {
    id: number,
    gender: 'F' | 'H',
    firstname: string,
    lastname: string,
    title: string,
    job_position: string,
    mobile_phone: string,
    work_fax: string,
    work_phone: string,
    work_email: string,
    work_address: string,
    home_email: string,
    home_address: string,
    birthday: string,
    avatar_url: string,
    tags: [
        string
    ],
    custom_properties: {},
    company: {
        id: string;
        type: string;
        name: string;
    };
    user: {
        id: string,
        firstname: string,
        lastname: string
    },
    created_at: string,
    updated_at: string,
    info: string
}
