import toPagination from "./to-pagination";

describe("toPagination", () => {
  it("starts at zero on the first page", () => {
    // ACT & ASSERT
    expect(toPagination({ page: 1, limit: 10 })).toEqual({ skip: 0, take: 10 });
  });

  it("skips the previous pages", () => {
    // ACT & ASSERT
    expect(toPagination({ page: 3, limit: 25 })).toEqual({
      skip: 50,
      take: 25,
    });
  });
});
