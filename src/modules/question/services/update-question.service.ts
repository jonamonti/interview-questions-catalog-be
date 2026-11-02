import { prisma } from "../../../db";
import { formatQuestion } from "../format/question.format";
import { updateQuestion } from "../repositories/question-write.repository";
import { UpdateQuestionRequest } from "../schemas/update-question.schema";

const updateQuestionService = async (
  id: number,
  input: UpdateQuestionRequest,
) => {
  const question = await prisma.$transaction((tx) =>
    updateQuestion(id, input, tx),
  );
  return formatQuestion(question);
};

export default updateQuestionService;
