import app from "./app";
import { NODE_ENV, PORT } from "./config";

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT} (${NODE_ENV})`);
});
