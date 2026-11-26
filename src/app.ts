import express from "express";
import errorHandler from "./middlewares/error-handler";
import apiRoutes from "./api.routes";
import requestLogger from "./middlewares/request-logger";
import notFoundHandler from "./middlewares/not-found";
import cors from "cors";
import helmet from "helmet";
import { CORS_ORIGINS } from "./config";

const app = express();

app.use(requestLogger);
// Security headers on every response, errors included; it also removes
// X-Powered-By. The Swagger UI page relaxes the CSP in openapi.routes.ts.
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGINS,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
  }),
);
// 64kb is enough for a 20,000-character answer plus title and tags. inflate: false rejects compressed bodies.
app.use(express.json({ limit: "64kb", inflate: false }));
app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
