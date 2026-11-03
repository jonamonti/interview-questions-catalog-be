import { prisma } from "../db";

export const resetDatabase = () =>
  prisma.$executeRaw`TRUNCATE TABLE "QuestionTag", "Question", "Tag" RESTART IDENTITY CASCADE`;
