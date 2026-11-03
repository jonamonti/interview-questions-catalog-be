import { Router } from "express";
import listTagsController from "./controllers/list-tags.controller";

const tagRoutes = Router();
tagRoutes.get("/", listTagsController);
export default tagRoutes;
