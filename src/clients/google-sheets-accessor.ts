import { GaxiosResponse } from "gaxios/build/src/common";
import { google, sheets_v4 } from "googleapis";
import { GoogleAuth } from "googleapis-common";
import Schema$ValueRange = sheets_v4.Schema$ValueRange;
import Sheets = sheets_v4.Sheets;

export class GoogleSheetsAccessor {
  private googleAuth: GoogleAuth;

  private client: any;

  private googleSheets: Sheets;

  public setupGoogle(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.setGoogleAuth()
        .then(() => this.authGoogle())
        .then(() => resolve(true));
    });
  }

  async getRows(spreadsheetId: string, range: string): Promise<GaxiosResponse<Schema$ValueRange>> {
    return new Promise((resolve, reject) => {
      this.googleSheets.spreadsheets.values
        .get({
          auth: this.googleAuth,
          spreadsheetId,
          range,
        })
        .then((rows) => {
          resolve(rows);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async addRows(spreadsheetId: string, range: string, rows: string[][]): Promise<any> {
    return this.googleSheets.spreadsheets.values.append({
      auth: this.googleAuth,
      valueInputOption: "RAW",
      spreadsheetId,
      range,
      requestBody: { values: rows, majorDimension: "COLUMNS" },
    });
  }

  private setGoogleAuth(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.googleAuth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      resolve(true);
    });
  }

  private async authGoogle(): Promise<any> {
    return await this.googleAuth
      .getClient()
      .then((client) => {
        this.client = client;
        this.googleSheets = google.sheets({ version: "v4", auth: this.client }) as Sheets;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
