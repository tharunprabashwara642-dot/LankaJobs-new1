import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import jobsRouter from "./jobs";
import categoriesRouter from "./categories";
import adminRouter from "./admin";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(jobsRouter);
router.use(categoriesRouter);
router.use(reportsRouter);
router.use(adminRouter);

export default router;
