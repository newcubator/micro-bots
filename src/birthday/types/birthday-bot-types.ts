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

export const EXAMPLE_BIRTHDAY_JANE: BirthdayType = {
    'id': 12345678,
    'firstname': 'Jane',
    'lastname': 'Doe',
    'active': true,
    'extern': false,
    'email': 'jane.doe@example.com',
    'mobile_phone': '',
    'work_phone': '123456789',
    'home_address': 'Jane Doe \r\nSome Street 14\r\n 12345 Some City',
    'info': '',
    'birthday': '2000-03-14',
    'avatar_url': '',
    'custom_properties': {
        'Betriebliche Altersvorsorge': '',
        'Laptop (Baujahr)': '',
        'Schlüsselnummer': '',
        'SlackId': '',
        'Smartphone (Baujahr)': '',
        'Standort': 'Hannover'
    },
    'unit': {
        'id': 928242738,
        'name': 'Team Example'
    },
    'created_at': '2020-04-01T08:59:47Z',
    'updated_at': '2021-02-24T13:29:29Z'
};

export const EXAMPLE_BIRTHDAY_JOHN: BirthdayType = {
    'id': 87654321,
    'firstname': 'John',
    'lastname': 'Doe',
    'active': true,
    'extern': false,
    'email': 'john.doe@example.com',
    'mobile_phone': '',
    'work_phone': '123456789',
    'home_address': 'John Doe \r\nSome Street 15\r\n 12345 Some City',
    'info': '',
    'birthday': '2000-05-29',
    'avatar_url': '',
    'custom_properties': {
        'Betriebliche Altersvorsorge': '',
        'Laptop (Baujahr)': '',
        'Schlüsselnummer': '',
        'SlackId': '',
        'Smartphone (Baujahr)': '',
        'Standort': 'Hannover'
    },
    'unit': {
        'id': 928242738,
        'name': 'Team Example'
    },
    'created_at': '2020-04-01T08:59:47Z',
    'updated_at': '2021-02-24T13:29:29Z'
};
