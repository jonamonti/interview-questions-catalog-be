import { Router } from "express";
import healthRoutes from "./modules/health/health.routes";
import questionRoutes from "./modules/question/question.routes";

const apiRoutes = Router();

apiRoutes.use("/health", healthRoutes);
apiRoutes.use("/questions", questionRoutes);

export default apiRoutes;
