import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (req, res) => {
  try {
    const data = HealthCheckResponse.parse({ status: "ok" });
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Health check failed");
    res.status(500).json({ status: "error" });
  }
});

export default router;
