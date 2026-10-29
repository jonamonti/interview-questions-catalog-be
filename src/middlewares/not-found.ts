import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error";
import { httpStatus } from "../constants/http-status.constants";
import { errorCode } from "../constants/error-codes.constants";

const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new AppError(
      httpStatus.NOT_FOUND,
      errorCode.NOT_FOUND,
      `Route ${req.method} ${req.originalUrl} not found`,
    ),
  );
};

export default notFoundHandler;
