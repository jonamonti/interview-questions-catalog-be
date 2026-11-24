import { makePreview } from "./make-preview.format";

describe("makePreview - Markdown syntax", () => {
  it.each([
    ["plain text", "Just text.", "Just text."],
    [
      "bold and italic",
      "A **bold** and *italic* word",
      "A bold and italic word",
    ],
    ["underscore emphasis", "An _emphasised_ word", "An emphasised word"],
    ["inline code", "Use `useEffect` here", "Use useEffect here"],
    ["a link", "See [the docs](https://x.dev) now", "See the docs now"],
    ["an image", "An ![diagram](x.png) here", "An diagram here"],
    ["a heading", "# Title\nline", "Title line"],
    ["a list", "- one\n- two", "one two"],
    ["a blockquote", "> quoted text", "quoted text"],
    ["HTML tags", "Text <b>bold</b> end", "Text bold end"],
    ["strikethrough", "some ~~gone~~ text", "some gone text"],
    [
      "identifiers and math",
      "snake_case_name and 2 * 3 * 4",
      "snake_case_name and 2 * 3 * 4",
    ],
  ])("turns %s into plain text", (_name, input, expected) => {
    // ACT & ASSERT
    expect(makePreview(input)).toBe(expected);
  });
});

describe("makePreview - fenced code blocks", () => {
  it.each([
    [
      "a ``` block between text",
      "Intro\n```js\nconst a = 1;\n```\nAfter",
      "Intro After",
    ],
    ["a ~~~ block between text", "Intro\n~~~\ncode\n~~~\nAfter", "Intro After"],
    ["an unclosed block after text", "Intro\n```js\ncode", "Intro"],
  ])("drops %s", (_name, input, expected) => {
    // ACT & ASSERT
    expect(makePreview(input)).toBe(expected);
  });

  it.each([
    [
      "an answer that is only code",
      "```js\nconst a = 1;\nconst b = 2;\n```",
      "const a = 1;",
    ],
    [
      "code that starts with blank lines",
      "```\n\n  indented()\n```",
      "indented()",
    ],
  ])("uses the first non-empty code line for %s", (_name, input, expected) => {
    // ACT & ASSERT
    expect(makePreview(input)).toBe(expected);
  });
});

describe("makePreview - whitespace", () => {
  it.each([
    ["spaces and blank lines", "a   b\n\n c", "a b c"],
    ["CRLF line endings", "a\r\nb", "a b"],
    ["an empty string", "", ""],
  ])("collapses %s", (_name, input, expected) => {
    // ACT & ASSERT
    expect(makePreview(input)).toBe(expected);
  });
});

describe("makePreview - length cap", () => {
  it("leaves a text of exactly 200 characters unchanged", () => {
    // ARRANGE
    const text = "a".repeat(200);

    // ACT & ASSERT
    expect(makePreview(text)).toBe(text);
  });

  it("does not count Markdown syntax towards the limit", () => {
    // ARRANGE
    const plain = "a".repeat(200);

    // ACT & ASSERT
    expect(makePreview(`**${plain}**`)).toBe(plain);
  });

  it("cuts at the last space before the limit and adds an ellipsis", () => {
    // ARRANGE
    const text = "abcdefgh ".repeat(40);

    // ACT
    const result = makePreview(text);

    // ASSERT
    expect(result).toBe(`${"abcdefgh ".repeat(21)}abcdefgh…`);
    expect(result.length).toBeLessThanOrEqual(201);
  });

  it.each([201, 300])(
    "cuts a single word of %i characters at the limit",
    (length) => {
      // ACT & ASSERT
      expect(makePreview("a".repeat(length))).toBe(`${"a".repeat(200)}…`);
    },
  );
});
