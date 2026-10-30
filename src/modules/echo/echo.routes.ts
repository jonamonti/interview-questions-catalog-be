import { Router } from "express";
import echoController from "./controllers/echo.controller";
import echoValidation from "./validation/echo.validation";

const echoRoutes = Router();
echoRoutes.post("/", echoValidation, echoController);
export default echoRoutes;
