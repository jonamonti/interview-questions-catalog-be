import type { RequestHandler } from "express";
import type { EchoRequest } from "../schemas/echo.schema";
import { SuccessResponse } from "../../../common/types/api-response.types";
import { httpStatus } from "../../../constants/http-status.constants";

const echoController: RequestHandler = (req, res) => {
  const { message, times } = req.validated.body as EchoRequest;

  const body: SuccessResponse<{ messages: string[] }> = {
    success: true,
    message: "Echo",
    data: { messages: Array.from({ length: times }, () => message) },
  };
  res.status(httpStatus.OK).json(body);
};

export default echoController;
