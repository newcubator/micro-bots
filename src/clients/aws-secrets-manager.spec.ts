import { AwsSecretsManager } from "./aws-secrets-manager";
describe("AwsSecretsManager", () => {
  it("should get secret from aws secrets-manager", async () => {
    const result = await AwsSecretsManager.getSecret("testname");
    expect(result).toEqual("supersecretvalue");
  });
});
