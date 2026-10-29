import express from "express";
import errorHandler from "./middlewares/error-handler";
import apiRoutes from "./api.routes";
import requestLogger from "./middlewares/request-logger";
import notFoundHandler from "./middlewares/not-found";

const app = express();

app.use(requestLogger);
app.use(express.json());
app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
