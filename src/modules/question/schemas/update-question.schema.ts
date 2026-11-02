import { z } from "zod";
import {
  questionAnswerSchema,
  questionTagsSchema,
  questionTitleSchema,
} from "./create-question.schema";
import { Difficulty } from "../../../generated/prisma/enums";

export const updateQuestionSchema = z
  .object({
    title: questionTitleSchema.optional(),
    answer: questionAnswerSchema.optional(),
    difficulty: z.enum(Difficulty).optional(),
    tags: questionTagsSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, "Send at least one field")
  .meta({
    id: "UpdateQuestion",
    description:
      "Body of PATCH /api/questions/{id}. Tags replace the current set",
    example: { title: "What is a closure?", tags: ["javascript"] },
  });

export type UpdateQuestionRequest = z.infer<typeof updateQuestionSchema>;
