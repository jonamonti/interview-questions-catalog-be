import { deleteQuestion } from "../repositories/question-write.repository";

const deleteQuestionService = async (id: number) => {
  await deleteQuestion(id);
};

export default deleteQuestionService;
