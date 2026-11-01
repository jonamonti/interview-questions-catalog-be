import { Router } from "express";
import apiKey from "../../middlewares/api-key";
import createQuestionValidation from "./validation/create-question.validation";
import createQuestionController from "./controllers/create-question.controller";
import listQuestionsValidation from "./validation/list-questions.validation";
import listQuestionsController from "./controllers/list-questions.controller";

const questionRoutes = Router();
questionRoutes.post(
  "/",
  apiKey,
  createQuestionValidation,
  createQuestionController,
);
questionRoutes.get("/", listQuestionsValidation, listQuestionsController);
export default questionRoutes;
