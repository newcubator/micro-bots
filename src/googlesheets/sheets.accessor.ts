import AWS from 'aws-sdk';
import { google } from 'googleapis';

export class SheetsAccessor {
    private static AWS_SECRET_NAME = process.env.AWS_SECRET_NAME;

    private static AWS_CLIENT = new AWS.SecretsManager({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_GOOGLE,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_GOOGLE,
        region: 'eu-central-1'
    });

    private GOOGLE_CREDENTIALS;

    private googleAuth;

    private SPREADSHEET_ID = process.env.SPREADSHEET_ID;

    private client: any;

    private googleSheets: any;

    public setupGoogle(): Promise<any> {
        return new Promise<any>(resolve => {
            this.getSecret()
                .then(() => this.setGoogleAuth())
                .then(() => this.authGoogle())
                .then(() => resolve(true));
        });
    }

    getRows(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            return this.googleSheets.spreadsheets.values
                .get({
                    auth: this.googleAuth,
                    spreadsheetId: this.SPREADSHEET_ID,
                    range: 'Sheet1!B2:B2',
                })
                .then((rows) => {
                    resolve(rows.data.values[0][0] !== 'FALSE');
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    reject('something went wrong');
                });
        });
    }

    async updateStatus(value: 'FALSE' | 'TRUE') {
        await this.googleSheets.spreadsheets.values.update({
            auth: this.googleAuth,
            spreadsheetId: this.SPREADSHEET_ID,
            range: 'Sheet1!B2:B2',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[value]],
            }
        });
    }

    private async getSecret(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            SheetsAccessor.AWS_CLIENT.getSecretValue({ SecretId: SheetsAccessor.AWS_SECRET_NAME }, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    this.GOOGLE_CREDENTIALS = JSON.parse(data.SecretString);
                    resolve(true);
                }
            });
        });
    }

    private setGoogleAuth() {
        return new Promise<boolean>(resolve => {
            this.googleAuth = new google.auth.GoogleAuth({
                credentials: { client_email: this.GOOGLE_CREDENTIALS.client_email, private_key: this.GOOGLE_CREDENTIALS.private_key },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            resolve(true);
        });
    }

    private async authGoogle() {
        return await this.googleAuth
            .getClient()
            .then((client) => {
                this.client = client;
                this.googleSheets = google.sheets({ version: 'v4', auth: this.client });
            })
            .catch((err) => {
                console.log(err);
            });
    }
}
