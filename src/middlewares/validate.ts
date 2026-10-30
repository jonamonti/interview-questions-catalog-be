import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

const validate =
  (schemas: ValidationSchemas): RequestHandler =>
  (req, _res, next) => {
    req.validated = {};

    if (schemas.body) req.validated.body = schemas.body.parse(req.body);
    if (schemas.query) req.validated.query = schemas.query.parse(req.query);
    if (schemas.params) req.validated.params = schemas.params.parse(req.params);

    next();
  };

export default validate;
