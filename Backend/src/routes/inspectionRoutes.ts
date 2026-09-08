import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { createInspection, getInspection, listInspections, updateInspection } from "../controllers/inspectionController";

const router = Router();
router.use(authenticate);
router.get("/", listInspections);
router.get("/:id", getInspection);
router.post("/", authorize("admin", "mine_manager", "inspector"), createInspection);
router.patch("/:id", authorize("admin", "mine_manager", "inspector"), updateInspection);
export default router;