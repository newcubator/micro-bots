export const SecretsManager = jest.fn();

SecretsManager.mockImplementation(() => {
  return {
    getSecretValue: jest.fn((args, callback) =>
      callback(undefined, {
        SecretString: JSON.stringify("supersecretvalue"),
      }),
    ),
  };
});
