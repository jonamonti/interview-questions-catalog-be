import { QuestionWithTags } from "../repositories/question-write.repository";

export const formatCreateQuestion = (question: QuestionWithTags) => ({
  id: question.id,
  title: question.title,
  answer: question.answer,
  difficulty: question.difficulty,
  tags: question.questionTags.map(({ tag }) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  })),
  createdAt: question.createdAt,
  updatedAt: question.updatedAt,
});

export type QuestionResponse = ReturnType<typeof formatCreateQuestion>;
