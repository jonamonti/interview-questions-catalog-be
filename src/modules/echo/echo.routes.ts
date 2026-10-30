import { Router } from "express";
import echoController from "./controllers/echo.controller";
import echoValidation from "./validation/echo.validation";
import apiKey from "../../middlewares/api-key";

const echoRoutes = Router();
echoRoutes.post("/", apiKey, echoValidation, echoController);
export default echoRoutes;
