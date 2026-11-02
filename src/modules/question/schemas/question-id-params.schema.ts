import { z } from "zod";

export const questionIdParamsSchema = z
  .object({
    id: z.coerce.number().int().positive().meta({ example: 1 }),
  })
  .strict()
  .meta({ id: "QuestionIdParams" });

export type QuestionIdParams = z.infer<typeof questionIdParamsSchema>;
