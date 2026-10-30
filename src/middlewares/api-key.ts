import type { RequestHandler } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { API_KEY } from "../config";
import { AppError } from "../utils/app-error";
import { httpStatus } from "../constants/http-status.constants";
import { errorCode } from "../constants/error-codes.constants";

const hash = (value: string) => createHash("sha256").update(value).digest();
const expectedKeyHash = hash(API_KEY);

const apiKey: RequestHandler = (req, _res, next) => {
  const providedKey = req.header("x-api-key");
  if (!providedKey || !timingSafeEqual(hash(providedKey), expectedKeyHash)) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      errorCode.UNAUTHORIZED,
      "Invalid or missing API Key",
    );
  }

  next();
};

export default apiKey;
