import validate from "../../../middlewares/validate";
import { questionIdParamsSchema } from "../schemas/question-id-params.schema";

const deleteQuestionValidation = validate({ params: questionIdParamsSchema });
export default deleteQuestionValidation;
