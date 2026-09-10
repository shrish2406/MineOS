import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { memoryUploadMiddleware } from "../middleware/uploadMiddleware";
import {
  checkInAttendance,
  listPendingAttendance,
  updateAttendanceStatus,
  uploadAttendanceImage
} from "../controllers/attendanceController";

const router = Router();

router.use(authenticate);

router.post(
  "/check-in",
  authorize("worker", "inspector", "contractor", "safety_officer", "mine_manager", "admin"),
  checkInAttendance
);

router.post(
  "/upload",
  authorize("worker", "inspector", "contractor", "safety_officer", "mine_manager", "admin"),
  memoryUploadMiddleware.single("file"),
  uploadAttendanceImage
);

router.get(
  "/pending",
  authorize("safety_officer", "mine_manager", "admin"),
  listPendingAttendance
);

router.patch(
  "/:id/status",
  authorize("safety_officer", "mine_manager", "admin"),
  updateAttendanceStatus
);

export default router;
