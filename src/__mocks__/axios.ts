export default {
  get: jest.fn().mockResolvedValue({}),
  post: jest.fn().mockResolvedValue({}),
  patch: jest.fn().mockResolvedValue({
    status: 200,
    data: {},
  }),
};
