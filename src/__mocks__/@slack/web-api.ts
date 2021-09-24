export const WebClient = jest.fn();

WebClient.mockImplementation(() => {
  return {
    files: {
      upload: jest.fn(),
    },
  };
});
