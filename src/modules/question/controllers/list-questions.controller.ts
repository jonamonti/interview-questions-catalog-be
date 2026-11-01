import type { RequestHandler } from "express";
import { PaginationQuery } from "../../../common/schemas/pagination.schema";
import listQuestionsService from "../services/list-questions.service";
import { SuccessResponse } from "../../../common/types/api-response.types";
import { httpStatus } from "../../../constants/http-status.constants";
import { QuestionListResponse } from "../schemas/question-response.schema";

const listQuestionsController: RequestHandler = async (req, res) => {
  const query = req.validated.query as PaginationQuery;
  const data = await listQuestionsService(query);
  const body: SuccessResponse<QuestionListResponse> = {
    success: true,
    message: "Questions retrieved successfully",
    data,
  };
  res.status(httpStatus.OK).json(body);
};

export default listQuestionsController;
