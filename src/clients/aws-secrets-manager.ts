import { GetSecretValueCommandOutput, SecretsManager } from "@aws-sdk/client-secrets-manager";

export class AwsSecretsManager {
  static awsSecretsManager = new SecretsManager({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_GOOGLE,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_GOOGLE,
    },
    region: "eu-central-1",
  });

  static getSecret = (secretName: string): Promise<GetSecretValueCommandOutput> => {
    return new Promise<GetSecretValueCommandOutput>((resolve, reject) => {
      this.awsSecretsManager.getSecretValue({ SecretId: secretName }, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(JSON.parse(data.SecretString));
        }
      });
    });
  };
}
