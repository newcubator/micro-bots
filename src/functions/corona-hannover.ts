import axios from 'axios';
import { SheetsAccessor } from '../googlesheets/sheets.accessor';
import { slackChatPostMessage } from '../slack/slack';

interface ResponseType {
    resultList: ResultItem[];
    succeeded: boolean;
}

interface ResultItem {
    vaccinationCenterPk: number;
    name: string;
    streetName: string;
    streetNumber: string;
    zipcode: string;
    city: string;
    scheduleSaturday: boolean;
    scheduleSunday: boolean;
    vaccinationCenterType: any;
    vaccineName: string;
    vaccineType: string;
    interval1to2: number;
    offsetStart2Appointment: number;
    offsetEnd2Appointment: number;
    distance: number;
    outOfStock: boolean;
    publicAppointment: boolean;
}

const VACCINATION_CENTER_HANNOVER = 'https://www.impfportal-niedersachsen.de/portal/rest/appointments/findVaccinationCenterListFree/30159?stiko=&count=1&birthdate=825202800000';

export const handler = async () => {
    const sheets = new SheetsAccessor();
    console.log('Starting new Check');
    return sheets.setupGoogle()
        .then(async () => {
                await request(sheets);
            }
        );
};

const request = async (sheets: SheetsAccessor) => {
    return await axios.get(VACCINATION_CENTER_HANNOVER, {}).then(async (response) => {
        const res: ResponseType = response.data;
        if (res.succeeded) {
            await check(response.data, sheets);
        } else {
            console.log(
                'something went wrong.',
                JSON.stringify(response.data),
            );

        }
        console.log('Finished Check');
    });
};

const check = (result: ResponseType, sheets: SheetsAccessor) => {
    const promises: Promise<any>[] = [];
    const hannoverChannelID = process.env.HANNOVER_CHANNEL_ID;
    let isNotified = false;
    promises.push(sheets.getRows()
        .then(value => isNotified = value));

    Promise.all(promises).then(() => {
        result.resultList.forEach(async (value) => {
            console.log(
                `Out of Stock: ${value.outOfStock
                }\t Public Appointment: ${value.publicAppointment}`,
            );
            if (!value.outOfStock && !isNotified) {
                await slackChatPostMessage('Es sind wieder Termine in Hannover vorhanden. 🎉\nSchau gleich nach bevor die wieder weg sind:\nhttps://www.impfportal-niedersachsen.de/portal/#/appointment/public',
                    hannoverChannelID,
                    'Impf Notification',
                    ':microbe:');
                await sheets.updateStatus('TRUE');
                isNotified = true;
            } else if (isNotified) {
                await sheets.updateStatus('FALSE');
                isNotified = false;
            }
        });
    });
};



