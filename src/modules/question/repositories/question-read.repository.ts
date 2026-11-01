import { prisma } from "../../../db";
import { questionWithTagsInclude } from "./question-write.repository";

export const findQuestions = ({ skip, take }: { skip: number; take: number }) =>
  prisma.question.findMany({
    skip,
    take,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: questionWithTagsInclude,
  });

export const countQuestions = () => prisma.question.count();
