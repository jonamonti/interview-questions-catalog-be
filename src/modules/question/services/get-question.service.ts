import { formatQuestion } from "../format/question.format";
import { findQuestionById } from "../repositories/question-read.repository";

const getQuestionService = async (id: number) => {
  const question = await findQuestionById(id);
  return formatQuestion(question);
};

export default getQuestionService;
