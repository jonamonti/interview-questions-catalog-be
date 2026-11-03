import { z } from "zod";
import { Prisma } from "../generated/prisma/client";
import { createMockResponse } from "../test/mocks";
import { AppError } from "../utils/app-error";
import errorHandler from "./error-handler";

let mockNodeEnv = "development";
jest.mock("../config", () => ({
  get NODE_ENV() {
    return mockNodeEnv;
  },
}));

const handle = (error: unknown) => {
  const res = createMockResponse();
  errorHandler(error, {} as never, res as never, jest.fn());
  return res;
};

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("boom", {
    code,
    clientVersion: "test",
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockNodeEnv = "development";
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

describe("errorHandler - AppError handling", () => {
  it("uses the status, code, message and details of the error", () => {
    // ACT
    const res = handle(new AppError(401, "UNAUTHORIZED", "Nope", { a: 1 }));

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Nope",
      error: { code: "UNAUTHORIZED", details: { a: 1 } },
    });
  });
});

describe("errorHandler - ZodError handling", () => {
  it("returns 400 with one detail per issue", () => {
    // ARRANGE
    const { error } = z
      .object({ title: z.string(), nested: z.object({ n: z.number() }) })
      .safeParse({ nested: { n: "x" } });

    // ACT
    const res = handle(error);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.message).toBe("Validation error");
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details.map((d: { path: string }) => d.path)).toEqual([
      "title",
      "nested.n",
    ]);
  });

  it("reports each unrecognized key on its own path", () => {
    // ARRANGE
    const { error } = z.object({}).strict().safeParse({ foo: 1, bar: 2 });

    // ACT
    const res = handle(error);

    // ASSERT
    expect(res.json.mock.calls[0][0].error.details).toEqual([
      { path: "foo", message: 'Unrecognized key: "foo"' },
      { path: "bar", message: 'Unrecognized key: "bar"' },
    ]);
  });
});

describe("errorHandler - Prisma error handling", () => {
  it.each([
    ["P2002", 409, "CONFLICT"],
    ["P2003", 409, "CONFLICT"],
    ["P2025", 404, "NOT_FOUND"],
  ])("maps %s to %i %s", (code, status, errorCode) => {
    // ACT
    const res = handle(prismaError(code));

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json.mock.calls[0][0].error.code).toBe(errorCode);
  });

  it("falls through to 500 for an unmapped Prisma code", () => {
    // ACT
    const res = handle(prismaError("P9999"));

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("errorHandler - malformed JSON handling", () => {
  it("returns 400 for a body parse SyntaxError", () => {
    // ARRANGE
    const error = Object.assign(new SyntaxError("Unexpected token"), {
      body: "{ nope",
    });

    // ACT
    const res = handle(error);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe("Malformed JSON body");
  });

  it("treats a SyntaxError without a body as a server error", () => {
    // ACT
    const res = handle(new SyntaxError("in our own code"));

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("errorHandler - unexpected error handling", () => {
  it("returns 500 with the stack outside production", () => {
    // ARRANGE
    const error = new Error("kaboom");

    // ACT
    const res = handle(error);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: false,
      message: "Internal server error",
      error: { code: "INTERNAL_ERROR", details: error.stack },
    });
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it("hides the stack in production", () => {
    // ARRANGE
    mockNodeEnv = "production";

    // ACT
    const res = handle(new Error("kaboom"));

    // ASSERT
    expect(res.json.mock.calls[0][0].error.details).toBeUndefined();
  });

  it("returns 500 without details for a non-Error value", () => {
    // ACT
    const res = handle("a string was thrown");

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].error.details).toBeUndefined();
  });
});
