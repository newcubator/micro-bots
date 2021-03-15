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
    custom_properties: {
        SlackId: string;
        Standort: string;
        [key: string]: string;
    };
    unit: { id: number, name: string };
    created_at: string;
    updated_at: string;
}
