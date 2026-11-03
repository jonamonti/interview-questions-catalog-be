import type { RequestHandler } from "express";
import { NODE_ENV } from "../config";

const requestLogger: RequestHandler = (req, res, next) => {
  if (NODE_ENV === "test") {
    next();
    return;
  }
  const startedAt = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });
  next();
};

export default requestLogger;
