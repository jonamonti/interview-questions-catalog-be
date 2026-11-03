import notFoundHandler from "./not-found";
import { AppError } from "../utils/app-error";

describe("notFoundHandler", () => {
  it("forwards a 404 AppError naming the route", () => {
    // ARRANGE
    const next = jest.fn();
    const req = { method: "GET", originalUrl: "/api/nope" };

    // ACT
    notFoundHandler(req as never, {} as never, next);

    // ASSERT
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
      message: "Route GET /api/nope not found",
    });
  });
});
