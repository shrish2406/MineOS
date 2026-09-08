import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { createCorrectiveAction, listCorrectiveActions, updateCorrectiveAction, verifyCorrectiveAction } from "../controllers/correctiveActionController";

const router = Router();
router.use(authenticate);
router.get("/", listCorrectiveActions);
router.post("/", authorize("admin", "mine_manager", "inspector"), createCorrectiveAction);
router.patch("/:id", authorize("admin", "mine_manager", "inspector"), updateCorrectiveAction);
router.patch("/:id/verify", authorize("admin", "mine_manager"), verifyCorrectiveAction);
export default router;