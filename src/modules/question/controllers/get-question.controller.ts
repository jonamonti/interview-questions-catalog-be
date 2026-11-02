import type { RequestHandler } from "express";
import { QuestionIdParams } from "../schemas/question-id-params.schema";
import getQuestionService from "../services/get-question.service";
import { SuccessResponse } from "../../../common/types/api-response.types";
import { QuestionResponse } from "../schemas/question-response.schema";
import { httpStatus } from "../../../constants/http-status.constants";

const getQuestionController: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as QuestionIdParams;
  const data = await getQuestionService(id);
  const body: SuccessResponse<QuestionResponse> = {
    success: true,
    message: "Question retrieved successfully",
    data,
  };
  res.status(httpStatus.OK).json(body);
};

export default getQuestionController;
