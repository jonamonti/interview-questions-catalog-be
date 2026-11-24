import toApiDifficulty from "../../../utils/to-api-difficulty";
import { QuestionWithTags } from "../repositories/question-write.repository";
import { QuestionResponse } from "../schemas/question-response.schema";
import { makePreview } from "./make-preview.format";
import { splitAnswer } from "./split-answer.format";

export const formatQuestion = (
  question: QuestionWithTags,
): QuestionResponse => {
  const { lead, body } = splitAnswer(question.answer);
  return {
    id: question.id,
    title: question.title,
    answer: question.answer,
    lead,
    body,
    preview: makePreview(lead),
    difficulty: toApiDifficulty(question.difficulty),
    tags: question.questionTags.map(({ tag }) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })),
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt.toISOString(),
  };
};
