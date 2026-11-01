import { z } from "zod";
import { Difficulty } from "../../../generated/prisma/enums";
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
    difficulty: z.enum(Difficulty),
    tags: z.array(tagResponseSchema),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({
    id: "Question",
    example: {
      id: 1,
      title: "What is a closure in JavaScript?",
      answer: "A function that **remembers** the scope it was created in.",
      difficulty: "MEDIUM",
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
