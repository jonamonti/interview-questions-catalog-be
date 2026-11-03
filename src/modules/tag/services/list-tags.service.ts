import { formatTagWithCount } from "../format/tag.format";
import { findTagsWithQuestionCount } from "../repositories/tag-read.repository";
import type { TagListResponse } from "../schemas/tag-list-response.schema";

const listTagsService = async (): Promise<TagListResponse> => {
  const tags = await findTagsWithQuestionCount();
  return { list: tags.map(formatTagWithCount) };
};

export default listTagsService;
