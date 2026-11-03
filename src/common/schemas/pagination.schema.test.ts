import { paginationQuerySchema } from "./pagination.schema";

describe("paginationQuerySchema", () => {
  it("applies the defaults", () => {
    // ACT & ASSERT
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 10 });
  });

  it("coerces numeric strings", () => {
    // ACT & ASSERT
    expect(paginationQuerySchema.parse({ page: "3", limit: "20" })).toEqual({
      page: 3,
      limit: 20,
    });
  });

  it.each([
    { page: 0 },
    { limit: 0 },
    { limit: 101 },
    { page: 1.5 },
    { foo: 1 },
  ])("rejects %j", (input) => {
    // ACT & ASSERT
    expect(paginationQuerySchema.safeParse(input).success).toBe(false);
  });
});
