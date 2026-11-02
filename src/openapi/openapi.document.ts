import { z } from "zod";
import { createDocument } from "zod-openapi";
import {
  errorResponseSchema,
  successResponseSchema,
} from "../common/schemas/api-response.schema";
import { healthResponseSchema } from "../modules/health/schemas/health-response.schema";
import { createQuestionSchema } from "../modules/question/schemas/create-question.schema";
import { listQuestionsQuerySchema } from "../modules/question/schemas/list-questions-query.schema";
import {
  questionListResponseSchema,
  questionResponseSchema,
} from "../modules/question/schemas/question-response.schema";

const json = <T extends z.ZodType>(schema: T) => ({
  "application/json": { schema },
});

const errorResponse = (description: string) => ({
  description,
  content: json(errorResponseSchema),
});

const unauthorized = errorResponse("Missing or wrong API key");
const validationError = errorResponse("Invalid input");
const serverError = errorResponse("Unexpected server error");

export const openApiDocument = createDocument({
  openapi: "3.1.0",
  info: {
    title: "Interview Questions Catalog API",
    version: "1.0.0",
    description:
      "Public read endpoints. Write endpoints need the `x-api-key` header.",
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: { type: "apiKey", in: "header", name: "x-api-key" },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check the API and the database",
        responses: {
          "200": {
            description: "API and database are reachable",
            content: json(
              successResponseSchema("HealthResponse", healthResponseSchema),
            ),
          },
          "503": errorResponse("Database is unreachable"),
        },
      },
    },
    "/api/questions": {
      get: {
        tags: ["Questions"],
        summary: "List questions, newest first, optionally filtered by tags",
        requestParams: { query: listQuestionsQuerySchema },
        responses: {
          "200": {
            description: "A page of questions",
            content: json(
              successResponseSchema(
                "ListQuestionsResponse",
                questionListResponseSchema,
              ),
            ),
          },
          "400": validationError,
          "500": serverError,
        },
      },
      post: {
        tags: ["Questions"],
        summary: "Create a question with tags",
        security: [{ ApiKeyAuth: [] }],
        requestBody: { content: json(createQuestionSchema) },
        responses: {
          "201": {
            description: "The created question",
            content: json(
              successResponseSchema(
                "CreateQuestionResponse",
                questionResponseSchema,
              ),
            ),
          },
          "400": validationError,
          "401": unauthorized,
          "409": errorResponse("A tag was created at the same time"),
          "500": serverError,
        },
      },
    },
  },
});
