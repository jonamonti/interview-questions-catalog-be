export type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
  send: jest.Mock;
};

export const createMockResponse = (): MockResponse => {
  const res = { status: jest.fn(), json: jest.fn(), send: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};
