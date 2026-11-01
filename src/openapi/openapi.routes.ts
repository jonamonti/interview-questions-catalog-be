import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.document";

const openApiRoutes = Router();

openApiRoutes.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});
openApiRoutes.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

export default openApiRoutes;
