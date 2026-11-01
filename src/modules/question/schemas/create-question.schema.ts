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
    example: {
      title: "What is a closure in JavaScript?",
      answer:
        "A function that **remembers** the scope it was created in.\n\n```js\nconst counter = () => {\n  let count = 0;\n  return () => ++count;\n};\n```",
      difficulty: "MEDIUM",
      tags: ["javascript", "closures"],
    },
  });

export type CreateQuestionRequest = z.infer<typeof createQuestionSchema>;
