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

  it("returns an empty tags list for a question without tags", () => {
    // ACT & ASSERT
    expect(formatQuestion(buildQuestionRow({ questionTags: [] })).tags).toEqual(
      [],
    );
  });
});
