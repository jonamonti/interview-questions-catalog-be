import { splitAnswer } from "./split-answer.format";

describe("splitAnswer", () => {
  it("returns the whole answer as the lead when it is a single paragraph", () => {
    // ACT & ASSERT
    expect(splitAnswer("A function that **remembers** its scope.")).toEqual({
      lead: "A function that **remembers** its scope.",
      body: "",
    });
  });

  it("keeps the lines of a multi-line first paragraph together", () => {
    // ACT & ASSERT
    expect(splitAnswer("Line one\nline two\n\nThe rest")).toEqual({
      lead: "Line one\nline two",
      body: "The rest",
    });
  });

  it("puts everything after the first blank line in the body, blank lines included", () => {
    // ACT & ASSERT
    expect(splitAnswer("Lead\n\nSecond\n\nThird")).toEqual({
      lead: "Lead",
      body: "Second\n\nThird",
    });
  });

  it("skips leading blank lines", () => {
    // ACT & ASSERT
    expect(splitAnswer("\n\n  \nLead\n\nBody")).toEqual({
      lead: "Lead",
      body: "Body",
    });
  });

  it("skips extra blank lines between the lead and the body", () => {
    // ACT & ASSERT
    expect(splitAnswer("Lead\n\n\n\nBody")).toEqual({
      lead: "Lead",
      body: "Body",
    });
  });

  it("handles CRLF line endings", () => {
    // ACT & ASSERT
    expect(splitAnswer("Lead\r\n\r\nBody\r\nmore")).toEqual({
      lead: "Lead",
      body: "Body\nmore",
    });
  });

  it("ignores trailing whitespace", () => {
    // ACT & ASSERT
    expect(splitAnswer("Lead\n\nBody\n\n  \n")).toEqual({
      lead: "Lead",
      body: "Body",
    });
  });

  it("does not split on a blank line inside a fenced code block", () => {
    // ARRANGE
    const answer = "Intro\n```js\nconst a = 1;\n\nconst b = 2;\n```\n\nAfter";

    // ACT & ASSERT
    expect(splitAnswer(answer)).toEqual({
      lead: "Intro\n```js\nconst a = 1;\n\nconst b = 2;\n```",
      body: "After",
    });
  });

  it("treats an answer that is only a code block as the lead", () => {
    // ARRANGE
    const answer = "```js\nconst a = 1;\n\nconst b = 2;\n```";

    // ACT & ASSERT
    expect(splitAnswer(answer)).toEqual({ lead: answer, body: "" });
  });

  it("supports ~~~ fences", () => {
    // ACT & ASSERT
    expect(splitAnswer("~~~\na\n\nb\n~~~\n\nBody")).toEqual({
      lead: "~~~\na\n\nb\n~~~",
      body: "Body",
    });
  });

  it("treats an unclosed fence as part of the lead", () => {
    // ACT & ASSERT
    expect(splitAnswer("Intro\n```js\ncode\n\nmore")).toEqual({
      lead: "Intro\n```js\ncode\n\nmore",
      body: "",
    });
  });

  it("does not treat headings specially", () => {
    // ACT & ASSERT
    expect(splitAnswer("# Title\nline\n\nBody")).toEqual({
      lead: "# Title\nline",
      body: "Body",
    });
  });

  it("keeps the indentation of the first line", () => {
    // ACT & ASSERT
    expect(splitAnswer("\n    indented code\n\nBody").lead).toBe(
      "    indented code",
    );
  });

  it("returns empty parts for an empty answer", () => {
    // ACT & ASSERT
    expect(splitAnswer("")).toEqual({ lead: "", body: "" });
  });
});
