import type { RequestHandler } from "express";
import listQuestionsService from "../services/list-questions.service";
import { SuccessResponse } from "../../../common/types/api-response.types";
import { httpStatus } from "../../../constants/http-status.constants";
import { QuestionListResponse } from "../schemas/question-response.schema";
import type { ListQuestionsQuery } from "../schemas/list-questions-query.schema";

const listQuestionsController: RequestHandler = async (req, res) => {
  const query = req.validated.query as ListQuestionsQuery;
  const data = await listQuestionsService(query);
  const body: SuccessResponse<QuestionListResponse> = {
    success: true,
    message: "Questions retrieved successfully",
    data,
  };
  res.status(httpStatus.OK).json(body);
};

export default listQuestionsController;
