import type { RequestHandler } from "express";
import { CreateQuestionRequest } from "../schemas/create-question.schema";
import createQuestionService from "../services/create-question.service";
import { SuccessResponse } from "../../../common/types/api-response.types";
import { QuestionResponse } from "../format/create-question.format";
import { httpStatus } from "../../../constants/http-status.constants";

const createQuestionController: RequestHandler = async (req, res) => {
  const input = req.validated.body as CreateQuestionRequest;
  const data = await createQuestionService(input);
  const body: SuccessResponse<QuestionResponse> = {
    success: true,
    message: "Question created successfully",
    data,
  };
  res.status(httpStatus.CREATED).json(body);
};

export default createQuestionController;
