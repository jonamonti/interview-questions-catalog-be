import type { TagWithQuestionCount } from "../repositories/tag-read.repository";
import type { TagWithCount } from "../schemas/tag-list-response.schema";

export const formatTagWithCount = ({
  id,
  name,
  slug,
  _count,
}: TagWithQuestionCount): TagWithCount => ({
  id,
  name,
  slug,
  questionCount: _count.questionTags,
});
