import AWS from 'aws-sdk';
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
    "firstAppoinmentDateSorterOnline": 1623967200000,
    "freeSlotSizeOnline"?: number,
    "maxFreeSlotPerDay"?: number,
}

const AWS_SECRET_NAME = process.env.AWS_SECRET_NAME;

const AWS_CLIENT = new AWS.SecretsManager({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_GOOGLE,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_GOOGLE,
    region: 'eu-central-1'
});

const VACCINATION_CENTER_HANNOVER = 'https://www.impfportal-niedersachsen.de/portal/rest/appointments/findVaccinationCenterListFree/30159?stiko=&count=1&birthdate=825202800000';

let GOOGLE_CREDENTIALS;

const getSecret = (): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        AWS_CLIENT.getSecretValue({ SecretId: AWS_SECRET_NAME }, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                GOOGLE_CREDENTIALS = JSON.parse(data.SecretString);
                resolve(true);
            }
        });
    });
};

let sheetsAccessor;

export const handler = () => {
    return new Promise<boolean>(async (resolve, reject) => {

        if (!GOOGLE_CREDENTIALS) {
            getSecret().then(() => {
                sheetsAccessor = new SheetsAccessor();
                console.log('Starting new Check');
                return sheetsAccessor.setupGoogle(GOOGLE_CREDENTIALS)
                    .then(async () => {
                            request(sheetsAccessor)
                                .then(() => resolve(true))
                                .catch(() => reject('something went wrong'));
                        }
                    );
            });
        } else {
            request(sheetsAccessor)
                .then(() => resolve(true))
                .catch(() => reject('something went wrong'));
        }
    });
};

const request = async (sheetsAccessor: SheetsAccessor) => {
    return await axios.get(VACCINATION_CENTER_HANNOVER, {}).then(async (response) => {
        const res: ResponseType = response.data;
        if (res.succeeded) {
            await check(response.data, sheetsAccessor);
        } else {
            console.log(
                'something went wrong.',
                JSON.stringify(response.data),
            );

        }
    })
        .finally(() => console.log('Finished Check'));
};

const check = async (result: ResponseType, sheetsAccessor: SheetsAccessor) => {
    const promises: Promise<any>[] = [];
    const hannoverChannelID = process.env.HANNOVER_CHANNEL_ID;
    let isNotified = false;
    promises.push(sheetsAccessor.getRows()
        .then(value => isNotified = value));

    return await Promise.all(promises).then(() => {
        result.resultList.forEach(async (value) => {
            console.log(
                `Out of Stock: ${value.outOfStock
                }\t freeSlotSizeOnline: ${value.freeSlotSizeOnline}`,
            );
            if (!value.outOfStock && !isNotified) {
                await slackChatPostMessage(`@Jörg Herbst @Lucas Meurer @Sepideh Adelpour \nEs gibt in Hannover wieder Freie Termine.\nAktuell sind es ${value.freeSlotSizeOnline} freie Termine 🎉\nSchau gleich nach bevor die wieder weg sind:\nhttps://www.impfportal-niedersachsen.de/portal/#/appointment/public`,
                    hannoverChannelID,
                    'Impf Notification',
                    ':microbe:');
                await sheetsAccessor.updateStatus('TRUE');
                isNotified = true;
            } else if (isNotified) {
                await sheetsAccessor.updateStatus('FALSE');
                isNotified = false;
            }
        });
    });
};



