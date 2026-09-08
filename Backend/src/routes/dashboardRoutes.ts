import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getDashboardSummary } from "../controllers/dashboardController";

const router = Router();
router.use(authenticate);
router.get("/summary", getDashboardSummary);
export default router;