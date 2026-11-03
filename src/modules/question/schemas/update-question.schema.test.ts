import { updateQuestionSchema } from "./update-question.schema";

describe("updateQuestionSchema", () => {
  it("accepts a single field without adding defaults for the others", () => {
    // ACT & ASSERT
    expect(updateQuestionSchema.parse({ title: "New" })).toEqual({
      title: "New",
    });
  });

  it("accepts an empty tags list", () => {
    // ACT & ASSERT
    expect(updateQuestionSchema.parse({ tags: [] })).toEqual({ tags: [] });
  });

  it("normalizes tags like the create schema", () => {
    // ACT & ASSERT
    expect(
      updateQuestionSchema.parse({ tags: ["React", " react "] }).tags,
    ).toEqual(["react"]);
  });

  it("rejects an empty body", () => {
    // ACT
    const result = updateQuestionSchema.safeParse({});

    // ASSERT
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Send at least one field");
  });

  it.each([
    ["an unknown key", { foo: 1 }],
    ["an invalid difficulty", { difficulty: "IMPOSSIBLE" }],
    ["an empty title", { title: "" }],
    [
      "more than 10 tags",
      { tags: Array.from({ length: 11 }, (_, i) => `t${i}`) },
    ],
  ])("rejects %s", (_name, input) => {
    // ACT & ASSERT
    expect(updateQuestionSchema.safeParse(input).success).toBe(false);
  });
});
