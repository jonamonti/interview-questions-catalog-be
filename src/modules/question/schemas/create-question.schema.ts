import { z } from "zod";
import { Difficulty } from "../../../generated/prisma/enums";
import toSlug from "../../../utils/to-slug";

const tagNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(50)
  .refine((name) => toSlug(name) !== "", "Tag must contain letters or numbers");

export const createQuestionSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    answer: z.string().trim().min(1),
    difficulty: z.enum(Difficulty),
    tags: z
      .array(tagNameSchema)
      .max(10)
      .transform((names) => [...new Set(names)])
      .default([]),
  })
  .strict()
  .meta({
    id: "CreateQuestion",
    description: "Body of POST /api/questions",
  });

export type CreateQuestionRequest = z.infer<typeof createQuestionSchema>;
