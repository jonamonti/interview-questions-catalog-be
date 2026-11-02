import toPagination from "../../../utils/to-pagination";
import { formatQuestion } from "../format/question.format";
import {
  countQuestions,
  findQuestions,
} from "../repositories/question-read.repository";
import type { ListQuestionsQuery } from "../schemas/list-questions-query.schema";
import { QuestionListResponse } from "../schemas/question-response.schema";

const listQuestionsService = async (
  query: ListQuestionsQuery,
): Promise<QuestionListResponse> => {
  const filter = { tags: query.tags, match: query.match };
  const [questions, total] = await Promise.all([
    findQuestions({ ...toPagination(query), filter }),
    countQuestions(filter),
  ]);

  return {
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
    list: questions.map(formatQuestion),
  };
};

export default listQuestionsService;
