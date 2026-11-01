import { paginationQuerySchema } from "../../../common/schemas/pagination.schema";
import validate from "../../../middlewares/validate";

const listQuestionsValidation = validate({ query: paginationQuerySchema });
export default listQuestionsValidation;
