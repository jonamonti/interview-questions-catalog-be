import validate from "../../../middlewares/validate";
import { questionIdParamsSchema } from "../schemas/question-id-params.schema";

const getQuestionValidation = validate({ params: questionIdParamsSchema });
export default getQuestionValidation;
