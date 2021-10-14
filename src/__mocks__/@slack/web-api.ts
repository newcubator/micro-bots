export const WebClient = jest.fn();

WebClient.mockImplementation(() => {
  return {
    conversations: {
      join: jest.fn().mockResolvedValue({ ok: true }),
    },
    files: {
      upload: jest.fn().mockResolvedValue({ ok: true }),
    },
    chat: {
      postMessage: jest.fn().mockResolvedValue(Promise.resolve({})),
    },
  };
});
