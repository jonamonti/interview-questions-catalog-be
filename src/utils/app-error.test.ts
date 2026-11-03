import { AppError } from "./app-error";

describe("AppError", () => {
  it("keeps the status, code, message and details", () => {
    // ACT
    const error = new AppError(404, "NOT_FOUND", "Missing", { id: 1 });

    // ASSERT
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AppError");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("Missing");
    expect(error.details).toEqual({ id: 1 });
  });

  it("has no details by default", () => {
    // ACT & ASSERT
    expect(
      new AppError(400, "VALIDATION_ERROR", "Bad").details,
    ).toBeUndefined();
  });
});
