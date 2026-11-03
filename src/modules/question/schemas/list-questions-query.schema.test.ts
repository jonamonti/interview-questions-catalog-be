import { listQuestionsQuerySchema } from "./list-questions-query.schema";

describe("listQuestionsQuerySchema", () => {
  it("applies the defaults", () => {
    // ACT & ASSERT
    expect(listQuestionsQuerySchema.parse({})).toEqual({
      page: 1,
      limit: 10,
      tags: [],
      match: "any",
    });
  });

  it("trims, lowercases, drops empties and de-duplicates the tags", () => {
    // ACT
    const result = listQuestionsQuerySchema.parse({
      tags: " JavaScript, react,,javascript ",
    });

    // ASSERT
    expect(result.tags).toEqual(["javascript", "react"]);
  });

  it("treats an empty tags string as no filter", () => {
    // ACT & ASSERT
    expect(listQuestionsQuerySchema.parse({ tags: "" }).tags).toEqual([]);
  });

  it("accepts match=all", () => {
    // ACT & ASSERT
    expect(listQuestionsQuerySchema.parse({ match: "all" }).match).toBe("all");
  });

  it("keeps the pagination rules", () => {
    // ACT & ASSERT
    expect(listQuestionsQuerySchema.safeParse({ limit: 101 }).success).toBe(
      false,
    );
    expect(listQuestionsQuerySchema.parse({ page: "2" }).page).toBe(2);
  });

  it.each([
    ["an invalid match", { match: "bogus" }],
    ["an unknown key", { foo: "bar" }],
    ["more than 10 tags", { tags: "a,b,c,d,e,f,g,h,i,j,k" }],
    ["a tag longer than 50 characters", { tags: "a".repeat(51) }],
  ])("rejects %s", (_name, input) => {
    // ACT & ASSERT
    expect(listQuestionsQuerySchema.safeParse(input).success).toBe(false);
  });
});
