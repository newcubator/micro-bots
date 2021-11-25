import { AwsSecretsManager } from "../clients/aws-secrets-manager";
import { GoogleSheetsAccessor } from "../clients/google-sheets-accessor";

export async function setUpSheetsAccessor(): Promise<GoogleSheetsAccessor> {
  const googleCredentials = await AwsSecretsManager.getSecret(process.env.AWS_SECRET_NAME);
  const googleSheetsAccessor = new GoogleSheetsAccessor();
  await googleSheetsAccessor.setupGoogle(googleCredentials);
  return googleSheetsAccessor;
}
