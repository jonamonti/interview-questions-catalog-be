import { prisma } from "../../../db";
import type { Prisma } from "../../../generated/prisma/client";
import toSlug from "../../../utils/to-slug";
import { CreateQuestionRequest } from "../schemas/create-question.schema";
import { UpdateQuestionRequest } from "../schemas/update-question.schema";

const tagToLink = (name: string) => ({
  tag: {
    connectOrCreate: {
      where: { slug: toSlug(name) },
      create: { name, slug: toSlug(name) },
    },
  },
});

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
        create: tags.map(tagToLink),
      },
    },
    include: questionWithTagsInclude,
  });

export const updateQuestion = (
  id: number,
  { title, answer, difficulty, tags }: UpdateQuestionRequest,
  tx?: Prisma.TransactionClient,
) =>
  (tx ?? prisma).question.update({
    where: { id },
    data: {
      title,
      answer,
      difficulty,
      ...(tags && {
        questionTags: { deleteMany: {}, create: tags.map(tagToLink) },
      }),
      updatedAt: new Date(),
    },
    include: questionWithTagsInclude,
  });

export const deleteQuestion = (id: number) =>
  prisma.question.delete({ where: { id } });
