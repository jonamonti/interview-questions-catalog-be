import type { ErrorCode } from "../../constants/error-codes.constants";

export type SuccessResponse<T = undefined> = {
  success: true;
  message: string;
  data?: T;
};

export type ErrorResponse = {
  success: false;
  message: string;
  error: {
    code: ErrorCode;
    details?: unknown;
  };
};
