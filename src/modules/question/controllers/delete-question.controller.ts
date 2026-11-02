import type { RequestHandler } from "express";
import { QuestionIdParams } from "../schemas/question-id-params.schema";
import deleteQuestionService from "../services/delete-question.service";
import { httpStatus } from "../../../constants/http-status.constants";

const deleteQuestionController: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as QuestionIdParams;
  await deleteQuestionService(id);
  res.status(httpStatus.NO_CONTENT).send();
};
export default deleteQuestionController;
