import validate from "../../../middlewares/validate";
import { questionIdParamsSchema } from "../schemas/question-id-params.schema";
import { updateQuestionSchema } from "../schemas/update-question.schema";

const updateQuestionValidation = validate({
  params: questionIdParamsSchema,
  body: updateQuestionSchema,
});

export default updateQuestionValidation;
