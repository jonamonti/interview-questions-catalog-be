import { Router } from "express";
import apiKey from "../../middlewares/api-key";
import createQuestionValidation from "./validation/create-question.validation";
import createQuestionController from "./controllers/create-question.controller";

const questionRoutes = Router();
questionRoutes.post(
  "/",
  apiKey,
  createQuestionValidation,
  createQuestionController,
);
export default questionRoutes;
