import { prisma } from "../../../db";
import type { Prisma } from "../../../generated/prisma/client";
import type { ListQuestionsQuery } from "../schemas/list-questions-query.schema";
import { questionWithTagsInclude } from "./question-write.repository";

type QuestionFilter = Pick<ListQuestionsQuery, "tags" | "match">;

const buildWhere = ({
  tags,
  match,
}: QuestionFilter): Prisma.QuestionWhereInput => {
  if (tags.length === 0) return {};
  const hasTag = (slug: string): Prisma.QuestionWhereInput => ({
    questionTags: { some: { tag: { slug } } },
  });
  return match === "all"
    ? { AND: tags.map(hasTag) }
    : { questionTags: { some: { tag: { slug: { in: tags } } } } };
};

export const findQuestions = ({
  skip,
  take,
  filter,
}: {
  skip: number;
  take: number;
  filter: QuestionFilter;
}) =>
  prisma.question.findMany({
    where: buildWhere(filter),
    skip,
    take,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: questionWithTagsInclude,
  });

export const countQuestions = (filter: QuestionFilter) =>
  prisma.question.count({ where: buildWhere(filter) });
