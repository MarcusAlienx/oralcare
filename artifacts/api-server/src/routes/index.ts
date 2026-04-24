import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai/conversations";
import leadsRouter from "./leads";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/openai", openaiRouter);
router.use(leadsRouter);
router.use(adminRouter);

export default router;
