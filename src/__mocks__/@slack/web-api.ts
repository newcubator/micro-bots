export const WebClient = jest.fn();

WebClient.mockImplementation(() => {
  return {
    conversations: {
      join: jest.fn().mockResolvedValue({ ok: true }),
      history: jest.fn().mockResolvedValue({ ok: true, messages: [] }),
      replies: jest.fn().mockResolvedValue({ ok: true, messages: [] }),
    },
    files: {
      upload: jest.fn().mockResolvedValue({ ok: true }),
    },
    chat: {
      postMessage: jest.fn().mockResolvedValue({ ok: true }),
    },
  };
});
