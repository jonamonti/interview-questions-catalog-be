import removeMarkdown from "remove-markdown";
import { FENCE_LINE } from "./split-answer.format";

const MAX_LENGTH = 200;

// Plain text of the lead for the question cards: fenced code blocks dropped
// (the first code line when nothing else is left), Markdown syntax removed,
// whitespace collapsed to single spaces. Texts over MAX_LENGTH are cut at the
// last space before the limit, plus an ellipsis.
export const makePreview = (lead: string): string => {
  const textLines: string[] = [];
  const codeLines: string[] = [];
  let insideFence = false;

  for (const line of lead.replace(/\r\n?/g, "\n").split("\n")) {
    if (FENCE_LINE.test(line)) {
      insideFence = !insideFence;
      continue;
    }
    (insideFence ? codeLines : textLines).push(line);
  }

  const text = textLines.join("\n");
  const source =
    text.trim() === ""
      ? (codeLines.find((line) => line.trim() !== "")?.trim() ?? "")
      : text;

  const plain = removeMarkdown(source).replace(/\s+/g, " ").trim();
  if (plain.length <= MAX_LENGTH) return plain;

  const cut = plain.slice(0, MAX_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
};
