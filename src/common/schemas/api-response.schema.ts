import { z } from "zod";
import { errorCode } from "../../constants/error-codes.constants";

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string().meta({ example: "Validation error" }),
    error: z.object({
      code: z.enum(errorCode),
      details: z
        .unknown()
        .optional()
        .meta({ description: "Extra info, e.g. the failed fields" }),
    }),
  })
  .meta({
    id: "ErrorResponse",
    description: "Shape of every error response",
    example: {
      success: false,
      message: "Validation error",
      error: {
        code: "VALIDATION_ERROR",
        details: [
          {
            path: "title",
            message: "Too small: expected string to have >=1 characters",
          },
        ],
      },
    },
  });

export const paginationMetaSchema = z
  .object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  })
  .meta({
    id: "PaginationMeta",
    example: { page: 1, limit: 10, total: 25, totalPages: 3 },
  });

export const successResponseSchema = <T extends z.ZodType>(
  id: string,
  data: T,
) =>
  z
    .object({
      success: z.literal(true),
      message: z.string(),
      data,
    })
    .meta({ id });
