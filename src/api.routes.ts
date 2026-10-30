import { Router } from "express";
import healthRoutes from "./modules/health/health.routes";
import echoRoutes from "./modules/echo/echo.routes";

const apiRoutes = Router();

apiRoutes.use("/health", healthRoutes);
apiRoutes.use("/echo", echoRoutes);

export default apiRoutes;
