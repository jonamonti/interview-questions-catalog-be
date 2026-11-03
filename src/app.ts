import express from "express";
import errorHandler from "./middlewares/error-handler";
import apiRoutes from "./api.routes";
import requestLogger from "./middlewares/request-logger";
import notFoundHandler from "./middlewares/not-found";
import cors from "cors";
import { CORS_ORIGINS } from "./config";

const app = express();

app.use(requestLogger);
app.use(
  cors({
    origin: CORS_ORIGINS,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
  }),
);
app.use(express.json());
app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
