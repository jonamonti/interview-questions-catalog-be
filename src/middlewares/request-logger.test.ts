import { EventEmitter } from "node:events";
import requestLogger from "./request-logger";

let mockNodeEnv = "development";
jest.mock("../config", () => ({
  get NODE_ENV() {
    return mockNodeEnv;
  },
}));

const run = () => {
  const res = Object.assign(new EventEmitter(), { statusCode: 200 });
  const next = jest.fn();
  requestLogger(
    { method: "GET", originalUrl: "/api/x" } as never,
    res as never,
    next,
  );
  res.emit("finish");
  return next;
};

beforeEach(() => jest.clearAllMocks());

describe("requestLogger", () => {
  it("logs the method, url, status and duration when the response finishes", () => {
    // ARRANGE
    mockNodeEnv = "development";
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);

    // ACT
    const next = run();

    // ASSERT
    expect(next).toHaveBeenCalledWith();
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/api\/x 200 \d+ms$/),
    );
    log.mockRestore();
  });

  it("stays silent in the test environment", () => {
    // ARRANGE
    mockNodeEnv = "test";
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);

    // ACT
    const next = run();

    // ASSERT
    expect(next).toHaveBeenCalledWith();
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
