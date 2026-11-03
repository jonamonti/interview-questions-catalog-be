import { z, ZodError } from "zod";
import validate from "./validate";

beforeEach(() => jest.clearAllMocks());

describe("validate", () => {
  it("stores the parsed body, query and params on req.validated", () => {
    // ARRANGE
    const middleware = validate({
      body: z.object({ name: z.string().trim() }),
      query: z.object({ page: z.coerce.number() }),
      params: z.object({ id: z.coerce.number() }),
    });
    const req = {
      body: { name: " Ada " },
      query: { page: "2" },
      params: { id: "7" },
    };
    const next = jest.fn();

    // ACT
    middleware(req as never, {} as never, next);

    // ASSERT
    expect(req).toMatchObject({
      validated: {
        body: { name: "Ada" },
        query: { page: 2 },
        params: { id: 7 },
      },
    });
    expect(next).toHaveBeenCalledWith();
  });

  it("only validates the parts that have a schema", () => {
    // ARRANGE
    const middleware = validate({
      params: z.object({ id: z.coerce.number() }),
    });
    const req = { body: "ignored", params: { id: "1" } };

    // ACT
    middleware(req as never, {} as never, jest.fn());

    // ASSERT
    expect(req).toMatchObject({ validated: { params: { id: 1 } } });
    expect(req).not.toHaveProperty("validated.body");
  });

  it("throws a ZodError when the input is invalid", () => {
    // ARRANGE
    const middleware = validate({ body: z.object({ name: z.string() }) });
    const next = jest.fn();

    // ACT & ASSERT
    expect(() => middleware({ body: {} } as never, {} as never, next)).toThrow(
      ZodError,
    );
    expect(next).not.toHaveBeenCalled();
  });
});
