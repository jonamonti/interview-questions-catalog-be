const FENCE_LINE = /^\s*(```|~~~)/;
const LEADING_BLANK_LINES = /^\s*\n/;

export type AnswerParts = {
  lead: string;
  body: string;
};

// The lead is the first paragraph of the Markdown answer: the text up to the
// first blank line that is not inside a fenced code block. The body is the rest.
export const splitAnswer = (answer: string): AnswerParts => {
  const lines = answer
    .replace(/\r\n?/g, "\n")
    .replace(LEADING_BLANK_LINES, "")
    .trimEnd()
    .split("\n");

  let insideFence = false;
  const blankLineIndex = lines.findIndex((line) => {
    if (FENCE_LINE.test(line)) {
      insideFence = !insideFence;
      return false;
    }
    return !insideFence && line.trim() === "";
  });

  if (blankLineIndex === -1) return { lead: lines.join("\n"), body: "" };

  return {
    lead: lines.slice(0, blankLineIndex).join("\n"),
    body: lines
      .slice(blankLineIndex + 1)
      .join("\n")
      .replace(LEADING_BLANK_LINES, "")
      .trimEnd(),
  };
};
