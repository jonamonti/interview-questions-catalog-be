import { z } from "zod";
import { apiDifficulty } from "../../../constants/difficulty.constants";
import { paginationMetaSchema } from "../../../common/schemas/api-response.schema";

export const tagResponseSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    slug: z.string(),
  })
  .meta({
    id: "Tag",
    example: { id: 1, name: "javascript", slug: "javascript" },
  });

export const questionResponseSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    answer: z.string().meta({ description: "Markdown" }),
    lead: z.string().meta({
      description:
        "Markdown. The first paragraph of the answer (blank lines inside fenced code blocks do not end it)",
    }),
    body: z.string().meta({
      description:
        "Markdown. The rest of the answer after the lead, empty when the answer is a single paragraph",
    }),
    preview: z.string().meta({
      description:
        "Plain text of the lead for list cards: no Markdown, no code blocks, one line of text, at most about 200 characters (cut at a word, with an ellipsis)",
    }),
    difficulty: z.enum(apiDifficulty),
    tags: z.array(tagResponseSchema),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({
    id: "Question",
    example: {
      id: 1,
      title: "What is a closure in JavaScript?",
      answer:
        "A function that **remembers** the scope it was created in.\n\nIt is created every time a function is created.",
      lead: "A function that **remembers** the scope it was created in.",
      body: "It is created every time a function is created.",
      preview: "A function that remembers the scope it was created in.",
      difficulty: "medium",
      tags: [{ id: 1, name: "javascript", slug: "javascript" }],
      createdAt: "2026-11-01T12:00:00.000Z",
      updatedAt: "2026-11-01T12:00:00.000Z",
    },
  });

export const questionListResponseSchema = z
  .object({
    pagination: paginationMetaSchema,
    list: z.array(questionResponseSchema),
  })
  .meta({ id: "QuestionList" });

export type QuestionResponse = z.infer<typeof questionResponseSchema>;
export type QuestionListResponse = z.infer<typeof questionListResponseSchema>;
