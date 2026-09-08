import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Mine } from "../models/Mine";
import { Violation } from "../models/Violation";
import { CorrectiveAction } from "../models/CorrectiveAction";

export async function getDashboardSummary(request: AuthenticatedRequest, response: Response): Promise<void> {
  const mineFilter = request.query.mineId ? { _id: request.query.mineId } : {};
  const mines = await Mine.find(mineFilter).select("_id").lean(); const mineIds = mines.map((mine) => mine._id);
  const [openViolations, criticalViolations, overdueActions] = await Promise.all([
    Violation.countDocuments({ mineId: { $in: mineIds }, status: { $ne: "resolved" } }),
    Violation.countDocuments({ mineId: { $in: mineIds }, severity: "critical", status: { $ne: "resolved" } }),
    CorrectiveAction.countDocuments({ mineId: { $in: mineIds }, status: { $nin: ["completed", "verified"] }, deadline: { $lt: new Date() } })
  ]);
  response.json({ totalMines: mineIds.length, compliancePercent: null, openViolations, criticalViolations, overdueActions, riskScore: null, generatedAt: new Date().toISOString() });
}