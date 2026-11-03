import { createQuestion } from "../modules/question/repositories/question-write.repository";
import type { QuestionWithTags } from "../modules/question/repositories/question-write.repository";
import { CreateQuestionRequest } from "../modules/question/schemas/create-question.schema";

export const API_KEY = "test-api-key";

export const seedQuestion = (overrides: Partial<CreateQuestionRequest> = {}) =>
  createQuestion({
    title: "What is a closure?",
    answer: "A function that remembers its scope.",
    difficulty: "MEDIUM",
    tags: [],
    ...overrides,
  });

export const slugsOf = (tags: { slug: string }[]) =>
  tags.map((tag) => tag.slug);

export const buildQuestionRow = (
  overrides: Partial<QuestionWithTags> = {},
): QuestionWithTags => ({
  id: 1,
  title: "What is a closure?",
  answer: "A function that remembers its scope.",
  difficulty: "MEDIUM",
  createdAt: new Date("2026-11-01T12:00:00.000Z"),
  updatedAt: new Date("2026-11-02T12:00:00.000Z"),
  questionTags: [
    {
      questionId: 1,
      tagId: 5,
      tag: { id: 5, name: "javascript", slug: "javascript" },
    },
  ],
  ...overrides,
});

export const buildFormattedQuestion = () => ({
  id: 1,
  title: "What is a closure?",
  answer: "A function that remembers its scope.",
  difficulty: "MEDIUM" as const,
  tags: [{ id: 5, name: "javascript", slug: "javascript" }],
  createdAt: "2026-11-01T12:00:00.000Z",
  updatedAt: "2026-11-02T12:00:00.000Z",
});
