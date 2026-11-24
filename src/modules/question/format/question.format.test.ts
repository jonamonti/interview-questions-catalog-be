import {
  buildFormattedQuestion,
  buildQuestionRow,
} from "../../../test/factories";
import { formatQuestion } from "./question.format";

describe("formatQuestion", () => {
  it("flattens the tag links and serializes the dates", () => {
    // ACT & ASSERT
    expect(formatQuestion(buildQuestionRow())).toEqual(
      buildFormattedQuestion(),
    );
  });

  it.each([
    ["EASY", "easy"],
    ["MEDIUM", "medium"],
    ["HARD", "hard"],
  ] as const)(
    "turns the database difficulty %j into the API value %j",
    (db, api) => {
      // ACT & ASSERT
      expect(
        formatQuestion(buildQuestionRow({ difficulty: db })).difficulty,
      ).toBe(api);
    },
  );

  it("adds the lead and the body of the answer and keeps the full answer", () => {
    // ARRANGE
    const answer = "First paragraph.\n\nSecond paragraph.";

    // ACT
    const result = formatQuestion(buildQuestionRow({ answer }));

    // ASSERT
    expect(result).toMatchObject({
      answer,
      lead: "First paragraph.",
      body: "Second paragraph.",
    });
  });

  it("adds a plain-text preview made from the lead only", () => {
    // ARRANGE
    const answer =
      "Use `useEffect` for **side effects**.\n\nA much longer body.";

    // ACT
    const result = formatQuestion(buildQuestionRow({ answer }));

    // ASSERT
    expect(result.preview).toBe("Use useEffect for side effects.");
  });

  it("returns an empty tags list for a question without tags", () => {
    // ACT & ASSERT
    expect(formatQuestion(buildQuestionRow({ questionTags: [] })).tags).toEqual(
      [],
    );
  });
});
