import { Router } from "express";
import apiKey from "../../middlewares/api-key";
import createQuestionValidation from "./validation/create-question.validation";
import createQuestionController from "./controllers/create-question.controller";
import listQuestionsValidation from "./validation/list-questions.validation";
import listQuestionsController from "./controllers/list-questions.controller";
import updateQuestionValidation from "./validation/update-question.validation";
import updateQuestionController from "./controllers/update-question.controller";
import deleteQuestionValidation from "./validation/delete-question.validation";
import deleteQuestionController from "./controllers/delete-question.controller";

const questionRoutes = Router();
questionRoutes.post(
  "/",
  apiKey,
  createQuestionValidation,
  createQuestionController,
);
questionRoutes.get("/", listQuestionsValidation, listQuestionsController);
questionRoutes.patch(
  "/:id",
  apiKey,
  updateQuestionValidation,
  updateQuestionController,
);
questionRoutes.delete(
  "/:id",
  apiKey,
  deleteQuestionValidation,
  deleteQuestionController,
);
export default questionRoutes;
