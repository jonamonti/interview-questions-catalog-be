import apiKey from "./api-key";
import { AppError } from "../utils/app-error";

const requestWithKey = (key?: string) =>
  ({ header: jest.fn().mockReturnValue(key) }) as never;

beforeEach(() => jest.clearAllMocks());

describe("apiKey", () => {
  it("calls next when the key matches", () => {
    // ARRANGE
    const next = jest.fn();

    // ACT
    apiKey(requestWithKey("test-api-key"), {} as never, next);

    // ASSERT
    expect(next).toHaveBeenCalledWith();
  });

  it("throws a 401 AppError when the key is missing", () => {
    // ARRANGE
    const next = jest.fn();

    // ACT & ASSERT
    expect(() => apiKey(requestWithKey(undefined), {} as never, next)).toThrow(
      expect.objectContaining({ statusCode: 401, code: "UNAUTHORIZED" }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it.each(["wrong-key", "x", "test-api-key-but-longer"])(
    "throws a 401 AppError for the wrong key %j",
    (key) => {
      // ACT & ASSERT
      expect(() => apiKey(requestWithKey(key), {} as never, jest.fn())).toThrow(
        AppError,
      );
    },
  );
});
