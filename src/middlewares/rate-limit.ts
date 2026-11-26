import type { RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import {
  RATE_LIMIT_AUTH_FAIL_MAX,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_WRITE_MAX,
} from "../config";
import { errorCode } from "../constants/error-codes.constants";
import { httpStatus } from "../constants/http-status.constants";
import { AppError } from "../utils/app-error";

const WRITE_METHODS = new Set(["POST", "PATCH", "DELETE"]);
const isRead = (method: string) => !WRITE_METHODS.has(method);

// One counter per client address, kept in memory. That is enough for a single
// instance; with several instances, pass a shared `store` (for example Redis).
const createLimiter = (
  options: Partial<Parameters<typeof rateLimit>[0]> & { limit: number },
): RequestHandler =>
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    standardHeaders: true,
    legacyHeaders: false,
    // The library has already set Retry-After; the error handler builds the
    // standard envelope, like for every other error.
    handler: (_req, _res, next) =>
      next(
        new AppError(
          httpStatus.TOO_MANY_REQUESTS,
          errorCode.RATE_LIMITED,
          "Too many requests, try again later",
        ),
      ),
    ...options,
  });

// Every request to the API.
export const globalLimiter = createLimiter({ limit: RATE_LIMIT_MAX });

// Requests that change data.
export const writeLimiter = createLimiter({
  limit: RATE_LIMIT_WRITE_MAX,
  skip: (req) => isRead(req.method),
});

// Only write requests answered with 401 count, so a client can't guess the API
// key; successful writes and reads don't use this budget.
export const authFailureLimiter = createLimiter({
  limit: RATE_LIMIT_AUTH_FAIL_MAX,
  skip: (req) => isRead(req.method),
  skipSuccessfulRequests: true,
  requestWasSuccessful: (_req, res) =>
    res.statusCode !== httpStatus.UNAUTHORIZED,
});
