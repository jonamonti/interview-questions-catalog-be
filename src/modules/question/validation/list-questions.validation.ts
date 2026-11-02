import validate from "../../../middlewares/validate";
import { listQuestionsQuerySchema } from "../schemas/list-questions-query.schema";

const listQuestionsValidation = validate({ query: listQuestionsQuerySchema });
export default listQuestionsValidation;
