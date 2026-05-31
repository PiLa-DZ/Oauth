import app from "./app.js";
import env from "./lib/env.schema.js";

const port = env.PORT;

app.listen(port, () => {
  console.log(`Server is listening op port ${port}`);
});
