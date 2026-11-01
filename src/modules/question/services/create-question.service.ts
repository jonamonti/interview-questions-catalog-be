import { prisma } from "../../../db";
import { formatQuestion } from "../format/question.format";
import { createQuestion } from "../repositories/question-write.repository";
import { CreateQuestionRequest } from "../schemas/create-question.schema";

const createQuestionService = async (input: CreateQuestionRequest) => {
  const question = await prisma.$transaction((tx) => createQuestion(input, tx));
  return formatQuestion(question);
};

export default createQuestionService;
