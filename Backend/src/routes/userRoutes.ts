import { Router } from "express";
import { listUsers } from "../controllers/userController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorize("admin", "mine_manager"));
router.get("/", listUsers);
export default router;