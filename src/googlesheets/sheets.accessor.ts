import { google } from "googleapis";

export class SheetsAccessor {
  private googleAuth;

  private SPREADSHEET_ID = process.env.SPREADSHEET_ID;

  private GOOGLE_CREDENTIALS;

  private client: any;

  private googleSheets: any;

  public setupGoogle(credentials: any): Promise<any> {
    this.GOOGLE_CREDENTIALS = credentials;
    return new Promise<any>((resolve) => {
      this.setGoogleAuth()
        .then(() => this.authGoogle())
        .then(() => resolve(true));
    });
  }

  async getRows(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.googleSheets.spreadsheets.values
        .get({
          auth: this.googleAuth,
          spreadsheetId: this.SPREADSHEET_ID,
          range: "Sheet1!B2:B2",
        })
        .then((rows) => {
          resolve(rows.data.values[0][0] !== "FALSE");
        })
        .catch((err) => {
          console.log(err);
          reject("something went wrong");
        });
    });
  }

  async updateStatus(value: "FALSE" | "TRUE") {
    await this.googleSheets.spreadsheets.values.update({
      auth: this.googleAuth,
      spreadsheetId: this.SPREADSHEET_ID,
      range: "Sheet1!B2:B2",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[value]],
      },
    });
  }

  private setGoogleAuth() {
    return new Promise<boolean>((resolve) => {
      this.googleAuth = new google.auth.GoogleAuth({
        credentials: {
          client_email: this.GOOGLE_CREDENTIALS.client_email,
          private_key: this.GOOGLE_CREDENTIALS.private_key,
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      resolve(true);
    });
  }

  private async authGoogle() {
    return await this.googleAuth
      .getClient()
      .then((client) => {
        this.client = client;
        this.googleSheets = google.sheets({ version: "v4", auth: this.client });
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
