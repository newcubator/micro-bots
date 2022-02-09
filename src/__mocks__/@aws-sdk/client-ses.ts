export const SES = jest.fn();

SES.mockImplementation(() => {
  return {
    sendEmail: jest.fn(),
  };
});
