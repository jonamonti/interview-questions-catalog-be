import { Router } from "express";
import healthRoutes from "./modules/health/health.routes";
import questionRoutes from "./modules/question/question.routes";
import tagRoutes from "./modules/tag/tag.routes";
import openApiRoutes from "./openapi/openapi.routes";

const apiRoutes = Router();

apiRoutes.use("/health", healthRoutes);
apiRoutes.use("/questions", questionRoutes);
apiRoutes.use("/tags", tagRoutes);
apiRoutes.use(openApiRoutes);

export default apiRoutes;
