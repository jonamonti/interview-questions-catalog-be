import type { PaginationQuery } from "../../../common/schemas/pagination.schema";
import toPagination from "../../../utils/to-pagination";
import { formatQuestion } from "../format/question.format";
import {
  countQuestions,
  findQuestions,
} from "../repositories/question-read.repository";
import { QuestionListResponse } from "../schemas/question-response.schema";

const listQuestionsService = async (
  query: PaginationQuery,
): Promise<QuestionListResponse> => {
  const [questions, total] = await Promise.all([
    findQuestions(toPagination(query)),
    countQuestions(),
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
