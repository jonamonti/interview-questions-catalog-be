import type { ErrorRequestHandler } from "express";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/app-error";
import type { ErrorResponse } from "../common/types/api-response.types";
import { type ErrorCode, errorCode } from "../constants/error-codes.constants";
import { httpStatus } from "../constants/http-status.constants";
import { NODE_ENV } from "../config";
import { ZodError } from "zod";

const isMalformedJson = (error: unknown) =>
  error instanceof SyntaxError && "body" in error;

const formatZodIssues = (error: ZodError) =>
  error.issues.flatMap((issue) =>
    issue.code === "unrecognized_keys"
      ? issue.keys.map((key) => ({
          path: [...issue.path, key].map(String).join("."),
          message: `Unrecognized key: "${key}"`,
        }))
      : [
          {
            path: issue.path.map(String).join("."),
            message: issue.message,
          },
        ],
  );

const prismaErrorMap: Record<
  string,
  { status: number; code: ErrorCode; message: string }
> = {
  P2002: {
    status: httpStatus.CONFLICT,
    code: errorCode.CONFLICT,
    message: "Resource already exists",
  },
  P2003: {
    status: httpStatus.CONFLICT,
    code: errorCode.CONFLICT,
    message: "Related resource constraint failed",
  },
  P2025: {
    status: httpStatus.NOT_FOUND,
    code: errorCode.NOT_FOUND,
    message: "Resource not found",
  },
};

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    const body: ErrorResponse = {
      success: false,
      message: error.message,
      error: { code: error.code, details: error.details },
    };
    res.status(error.statusCode).json(body);
    return;
  }

  if (error instanceof ZodError) {
    const body: ErrorResponse = {
      success: false,
      message: "Validation error",
      error: {
        code: errorCode.VALIDATION_ERROR,
        details: formatZodIssues(error),
      },
    };
    res.status(httpStatus.BAD_REQUEST).json(body);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = prismaErrorMap[error.code];
    if (mapped) {
      const body: ErrorResponse = {
        success: false,
        message: mapped.message,
        error: { code: mapped.code },
      };
      res.status(mapped.status).json(body);
      return;
    }
  }

  if (isMalformedJson(error)) {
    const body: ErrorResponse = {
      success: false,
      message: "Malformed JSON body",
      error: { code: errorCode.VALIDATION_ERROR },
    };
    res.status(httpStatus.BAD_REQUEST).json(body);
    return;
  }

  console.error(error);

  const body: ErrorResponse = {
    success: false,
    message: "Internal server error",
    error: {
      code: errorCode.INTERNAL_ERROR,
      details:
        NODE_ENV === "production" || !(error instanceof Error)
          ? undefined
          : error.stack,
    },
  };
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json(body);
};

export default errorHandler;
