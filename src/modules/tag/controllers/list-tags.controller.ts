import type { RequestHandler } from "express";
import type { SuccessResponse } from "../../../common/types/api-response.types";
import { httpStatus } from "../../../constants/http-status.constants";
import type { TagListResponse } from "../schemas/tag-list-response.schema";
import listTagsService from "../services/list-tags.service";

const listTagsController: RequestHandler = async (_req, res) => {
  const data = await listTagsService();
  const body: SuccessResponse<TagListResponse> = {
    success: true,
    message: "Tags retrieved successfully",
    data,
  };
  res.status(httpStatus.OK).json(body);
};

export default listTagsController;
