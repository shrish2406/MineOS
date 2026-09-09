import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  listWorkers,
  getWorkersSummary,
  createWorker,
  getWorkerTasks,
  toggleWorkerTask,
  getWorkerAttendance
} from "../controllers/workerController";

const router = Router();

router.use(authenticate);
router.get("/", listWorkers);
router.get("/summary", getWorkersSummary);
router.post("/", createWorker);

// Worker space
router.get("/tasks", getWorkerTasks);
router.patch("/tasks/:id/toggle", toggleWorkerTask);
router.get("/attendance", getWorkerAttendance);

export default router;
