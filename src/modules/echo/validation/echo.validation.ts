import validate from "../../../middlewares/validate";
import { echoRequestSchema } from "../schemas/echo.schema";

const echoValidation = validate({ body: echoRequestSchema });

export default echoValidation;
