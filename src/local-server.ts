import { app } from "../app.js";
import { getEnv } from "./config/env.js";

const env = getEnv();

app.listen(env.PORT, () => {
  console.log(`Case Study Grading API listening on port ${env.PORT}`);
});
