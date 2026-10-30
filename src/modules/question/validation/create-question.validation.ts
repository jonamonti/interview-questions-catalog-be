import validate from "../../../middlewares/validate";
import { createQuestionSchema } from "../schemas/create-question.schema";

const createQuestionValidation = validate({ body: createQuestionSchema });
export default createQuestionValidation;
