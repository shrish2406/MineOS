import { Router } from "express";
import { createMine, deleteMine, getMine, listMines, updateMine } from "../controllers/mineController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/", listMines);
router.get("/:id", getMine);
router.post("/", authorize("admin", "mine_manager"), createMine);
router.patch("/:id", authorize("admin", "mine_manager"), updateMine);
router.delete("/:id", authorize("admin"), deleteMine);

export default router;