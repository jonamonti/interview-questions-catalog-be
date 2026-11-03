import { createQuestionSchema } from "./create-question.schema";

const valid = { title: "Title", answer: "Answer", difficulty: "EASY" };

describe("createQuestionSchema", () => {
  it("defaults tags to an empty list", () => {
    // ACT & ASSERT
    expect(createQuestionSchema.parse(valid).tags).toEqual([]);
  });

  it("trims the text fields", () => {
    // ACT
    const result = createQuestionSchema.parse({
      ...valid,
      title: "  Title  ",
      answer: "  Answer  ",
    });

    // ASSERT
    expect(result).toMatchObject({ title: "Title", answer: "Answer" });
  });

  it("lowercases and de-duplicates the tags", () => {
    // ACT
    const result = createQuestionSchema.parse({
      ...valid,
      tags: ["JavaScript", " javascript ", "C++"],
    });

    // ASSERT
    expect(result.tags).toEqual(["javascript", "c++"]);
  });

  it.each([
    ["an empty title", { title: "   " }],
    ["a title over 200 characters", { title: "a".repeat(201) }],
    ["an empty answer", { answer: "" }],
    ["an invalid difficulty", { difficulty: "IMPOSSIBLE" }],
    ["a missing difficulty", { difficulty: undefined }],
    [
      "more than 10 tags",
      { tags: Array.from({ length: 11 }, (_, i) => `t${i}`) },
    ],
    ["a tag with only symbols", { tags: ["!!!"] }],
    ["a tag over 50 characters", { tags: ["a".repeat(51)] }],
    ["an unknown key", { foo: 1 }],
  ])("rejects %s", (_name, override) => {
    // ACT & ASSERT
    expect(
      createQuestionSchema.safeParse({ ...valid, ...override }).success,
    ).toBe(false);
  });
});
