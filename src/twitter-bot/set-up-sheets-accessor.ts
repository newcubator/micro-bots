import { GoogleSheetsAccessor } from "../clients/google-sheets-accessor";

export async function setUpSheetsAccessor(): Promise<GoogleSheetsAccessor> {
  const googleSheetsAccessor = new GoogleSheetsAccessor();
  await googleSheetsAccessor.setupGoogle();
  return googleSheetsAccessor;
}
