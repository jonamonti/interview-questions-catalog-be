import type { RequestHandler } from "express";
import { QuestionIdParams } from "../schemas/question-id-params.schema";
import { UpdateQuestionRequest } from "../schemas/update-question.schema";
import updateQuestionService from "../services/update-question.service";
import type { SuccessResponse } from "../../../common/types/api-response.types";
import type { QuestionResponse } from "../schemas/question-response.schema";
import { httpStatus } from "../../../constants/http-status.constants";

const updateQuestionController: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as QuestionIdParams;
  const input = req.validated.body as UpdateQuestionRequest;
  const data = await updateQuestionService(id, input);
  const body: SuccessResponse<QuestionResponse> = {
    success: true,
    message: "Question updated successfully",
    data,
  };
  res.status(httpStatus.OK).json(body);
};

export default updateQuestionController;
