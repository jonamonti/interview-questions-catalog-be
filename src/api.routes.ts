import { Router } from "express";
import healthRoutes from "./modules/health/health.routes";

const apiRoutes = Router();

apiRoutes.use("/health", healthRoutes);

export default apiRoutes;
