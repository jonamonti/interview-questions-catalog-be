import { prisma } from "../../../db";
import type { Prisma } from "../../../generated/prisma/client";
import toSlug from "../../../utils/to-slug";
import { CreateQuestionRequest } from "../schemas/create-question.schema";

export const questionWithTagsInclude = {
  questionTags: {
    include: { tag: true },
    orderBy: { tag: { name: "asc" } },
  },
} satisfies Prisma.QuestionInclude;

export type QuestionWithTags = Prisma.QuestionGetPayload<{
  include: typeof questionWithTagsInclude;
}>;

export const createQuestion = (
  { title, answer, difficulty, tags }: CreateQuestionRequest,
  tx?: Prisma.TransactionClient,
) =>
  (tx ?? prisma).question.create({
    data: {
      title,
      answer,
      difficulty,
      questionTags: {
        create: tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { slug: toSlug(name) },
              create: { name, slug: toSlug(name) },
            },
          },
        })),
      },
    },
    include: questionWithTagsInclude,
  });
