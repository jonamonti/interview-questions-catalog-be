import type { RequestHandler } from "express";
import { prisma } from "../../db";
import {
  ErrorResponse,
  SuccessResponse,
} from "../../common/types/api-response.types";
import { errorCode } from "../../constants/error-codes.constants";
import { httpStatus } from "../../constants/http-status.constants";

type HealthData = { status: "ok"; database: "connected" };

const healthController: RequestHandler = async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error(error);
    const body: ErrorResponse = {
      success: false,
      message: "Database is unreachable",
      error: { code: errorCode.SERVICE_UNAVAILABLE },
    };
    res.status(httpStatus.SERVICE_UNAVAILABLE).json(body);
    return;
  }

  const body: SuccessResponse<HealthData> = {
    success: true,
    message: "Service is healthy",
    data: { status: "ok", database: "connected" },
  };
  res.status(httpStatus.OK).json(body);
};

export default healthController;
