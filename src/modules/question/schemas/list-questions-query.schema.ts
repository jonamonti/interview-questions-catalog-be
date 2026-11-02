import { z } from "zod";
import { paginationQuerySchema } from "../../../common/schemas/pagination.schema";

const tagSlugsSchema = z
  .string()
  .transform((value) => [
    ...new Set(
      value
        .split(",")
        .map((slug) => slug.trim().toLowerCase())
        .filter(Boolean),
    ),
  ])
  .pipe(z.array(z.string().max(50)).max(10))
  .meta({
    description: "Comma-separated tag slugs, e.g. `javascript,closures`",
    example: "javascript,closures",
  });

export const listQuestionsQuerySchema = paginationQuerySchema
  .extend({
    tags: tagSlugsSchema.default([]),
    match: z.enum(["any", "all"]).default("any").meta({
      description:
        "`any`: at least one of the tags. `all`: every one of the tags",
    }),
  })
  .meta({
    id: "ListQuestionsQuery",
    description: "Pagination plus tag filtering for GET /api/questions",
  });

export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;
