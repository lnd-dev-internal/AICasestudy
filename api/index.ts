import type { IncomingMessage, ServerResponse } from "node:http";

import { app } from "../src/express-app.js";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req as never, res as never);
}
