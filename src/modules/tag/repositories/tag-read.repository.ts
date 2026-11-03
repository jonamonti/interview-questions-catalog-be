import { prisma } from "../../../db";

export const findTagsWithQuestionCount = () =>
  prisma.tag.findMany({
    where: { questionTags: { some: {} } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { questionTags: true } },
    },
  });

export type TagWithQuestionCount = Awaited<
  ReturnType<typeof findTagsWithQuestionCount>
>[number];
