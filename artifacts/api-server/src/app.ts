import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Load OpenAPI spec
const openApiFilePath = path.resolve(process.cwd(), "../../lib/api-spec/openapi.yaml");
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
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
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
