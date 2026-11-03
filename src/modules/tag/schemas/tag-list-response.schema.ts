import { z } from "zod";

export const tagWithCountSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    slug: z.string(),
    questionCount: z.number().int().min(0),
  })
  .meta({
    id: "TagWithCount",
    example: {
      id: 1,
      name: "javascript",
      slug: "javascript",
      questionCount: 12,
    },
  });

export const tagListResponseSchema = z
  .object({ list: z.array(tagWithCountSchema) })
  .meta({ id: "TagList" });

export type TagWithCount = z.infer<typeof tagWithCountSchema>;
export type TagListResponse = z.infer<typeof tagListResponseSchema>;
