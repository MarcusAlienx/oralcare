import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

// Determine workspace root relative to the server entry point.
// process.argv[1] = the file passed to node (e.g. artifacts/api-server/index.mjs),
// so dirname(argv[1]) = artifacts/api-server/, and two levels up = workspace root.
const serverDir = path.dirname(path.resolve(process.argv[1]!));
const workspaceRoot = path.resolve(serverDir, "../..");

// Load OpenAPI spec
const openApiFilePath = path.join(workspaceRoot, "lib/api-spec/openapi.yaml");
let swaggerDocument: any;
try {
  const fileContents = fs.readFileSync(openApiFilePath, "utf8");
  swaggerDocument = yaml.load(fileContents);
} catch (e) {
  logger.error("Failed to load OpenAPI spec", e);
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (swaggerDocument) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use("/api", router);

// Serve built frontend in production (artifacts/oralcare/dist/public/)
const frontendDist = path.join(workspaceRoot, "artifacts/oralcare/dist/public");
if (process.env.NODE_ENV === "production" && fs.existsSync(frontendDist)) {
  logger.info({ frontendDist }, "Serving frontend static files");
  app.use(express.static(frontendDist));
  // SPA fallback — send index.html for any non-API route (Express 5 syntax)
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((err: any, req: any, res: any, _next: any) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  if (req.log) {
    req.log.error({ err }, message);
  } else {
    logger.error({ err }, message);
  }
  res.status(status).json({ error: message });
});

export default app;
