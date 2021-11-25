export const TwitterApi = jest.fn();

TwitterApi.mockImplementation(() => {
  return {
    v1: {
      tweet: jest.fn().mockReturnValue({ id_str: "", full_text: "" }),
    },
    v2: {
      userByUsername: jest.fn(),
      userTimeline: jest.fn(),
    },
  };
});
