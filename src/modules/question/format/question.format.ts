import { QuestionWithTags } from "../repositories/question-write.repository";
import { QuestionResponse } from "../schemas/question-response.schema";

export const formatQuestion = (
  question: QuestionWithTags,
): QuestionResponse => ({
  id: question.id,
  title: question.title,
  answer: question.answer,
  difficulty: question.difficulty,
  tags: question.questionTags.map(({ tag }) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  })),
  createdAt: question.createdAt.toISOString(),
  updatedAt: question.updatedAt.toISOString(),
});
