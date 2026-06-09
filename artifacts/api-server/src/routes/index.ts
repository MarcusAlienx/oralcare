import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import geminiRouter from "./gemini/conversations";
import leadsRouter from "./leads";
import adminRouter from "./admin";
import crmRouter from "./crm";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/gemini", geminiRouter);
router.use(leadsRouter);
router.use(adminRouter);
router.use("/crm", crmRouter);

export default router;
